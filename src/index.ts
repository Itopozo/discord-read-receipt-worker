import { verifyKey } from "discord-interactions";

const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
} as const;

const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
} as const;

const MessageFlags = {
  EPHEMERAL: 1 << 6,
} as const;

type DiscordInteraction = {
  id: string;
  type: number;
  token: string;
  guild_id?: string;
  channel_id?: string;
  member?: { user?: DiscordUser };
  user?: DiscordUser;
  data?: { name?: string; custom_id?: string };
};

type DiscordUser = {
  id: string;
  username?: string;
};

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function interactionMessage(content: string, ephemeral = false): Response {
  return json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content,
      ...(ephemeral ? { flags: MessageFlags.EPHEMERAL } : {}),
    },
  });
}

async function verifyDiscordRequest(
  request: Request,
  publicKey: string,
): Promise<{ valid: boolean; body: string }> {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");

  if (!signature || !timestamp) {
    return { valid: false, body: "" };
  }

  const body = await request.text();
  const valid = await verifyKey(body, signature, timestamp, publicKey);
  return { valid, body };
}

async function handleNoticeTest(
  interaction: DiscordInteraction,
  env: Env,
): Promise<Response> {
  const author = interaction.member?.user ?? interaction.user;
  if (!author || !interaction.guild_id) {
    return interactionMessage("サーバー内で実行してください。", true);
  }

  const noticeId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO notices
      (id, guild_id, channel_id, author_id, title, body, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      noticeId,
      interaction.guild_id,
      interaction.channel_id ?? null,
      author.id,
      "テストのお知らせ",
      "これは確認ボタンの表示テストです。",
      now,
    )
    .run();

  return json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content:
        "📢 **テストのお知らせ**\n\nこれは確認ボタンの表示テストです。\n内容を確認したら、下のボタンを押してください。",
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 3,
              label: "確認しました",
              custom_id: `confirm:${noticeId}`,
              emoji: { name: "✅" },
            },
          ],
        },
      ],
    },
  });
}

async function handleConfirmButton(
  interaction: DiscordInteraction,
  env: Env,
): Promise<Response> {
  const user = interaction.member?.user ?? interaction.user;
  const customId = interaction.data?.custom_id;

  if (!user || !customId?.startsWith("confirm:")) {
    return interactionMessage("確認情報を読み取れませんでした。", true);
  }

  const noticeId = customId.slice("confirm:".length);
  const notice = await env.DB.prepare(
    "SELECT id FROM notices WHERE id = ?",
  )
    .bind(noticeId)
    .first<{ id: string }>();

  if (!notice) {
    return interactionMessage("このお知らせは見つかりません。", true);
  }

  const result = await env.DB.prepare(
    `INSERT OR IGNORE INTO confirmations
      (notice_id, user_id, confirmed_at)
     VALUES (?, ?, ?)`,
  )
    .bind(noticeId, user.id, new Date().toISOString())
    .run();

  const newlyConfirmed = (result.meta.changes ?? 0) > 0;

  return interactionMessage(
    newlyConfirmed ? "✅ 確認を記録しました。" : "✅ すでに確認済みです。",
    true,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response("discord-read-receipt-worker is running");
    }

    if (request.method !== "POST" || url.pathname !== "/interactions") {
      return new Response("Not Found", { status: 404 });
    }

    try {
      const { valid, body } = await verifyDiscordRequest(
        request,
        env.DISCORD_PUBLIC_KEY,
      );

      if (!valid) {
        return new Response("Bad request signature", { status: 401 });
      }

      const interaction = JSON.parse(body) as DiscordInteraction;

      if (interaction.type === InteractionType.PING) {
        return json({ type: InteractionResponseType.PONG });
      }

      if (
        interaction.type === InteractionType.APPLICATION_COMMAND &&
        interaction.data?.name === "notice-test"
      ) {
        return await handleNoticeTest(interaction, env);
      }

      if (
        interaction.type === InteractionType.MESSAGE_COMPONENT &&
        interaction.data?.custom_id?.startsWith("confirm:")
      ) {
        return await handleConfirmButton(interaction, env);
      }

      return interactionMessage("未対応の操作です。", true);
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "error",
          event: "interaction_failed",
          message: error instanceof Error ? error.message : String(error),
        }),
      );
      return new Response("Internal Server Error", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
