const applicationId = process.env.DISCORD_APPLICATION_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;

if (!applicationId || !botToken || !guildId) {
  throw new Error(
    "DISCORD_APPLICATION_ID、DISCORD_BOT_TOKEN、DISCORD_GUILD_IDを設定してください。",
  );
}

const command = {
  name: "notice-test",
  description: "確認ボタン付きのテスト通知を投稿します",
  type: 1,
};

const response = await fetch(
  `https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`,
  {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  },
);

if (!response.ok) {
  throw new Error(
    `コマンド登録に失敗しました: ${response.status} ${await response.text()}`,
  );
}

console.log("Guild Slash Command /notice-test を登録しました。");
console.log(await response.json());
