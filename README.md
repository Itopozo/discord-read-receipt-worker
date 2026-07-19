# Discord既読確認Bot

Cloudflare Workers、D1、Discord Interactionを利用した既読確認Botです。

## 現在のテスト機能

- `/notice-test` で確認ボタン付きメッセージを投稿
- 「✅ 確認しました」ボタンを表示
- 押したDiscordユーザーと確認日時をD1へ保存
- 二重押下は「すでに確認済み」と本人だけに表示
- Interactionリクエストの署名検証

## 1. インストール

```bash
npm install
```

## 2. D1を作成

```bash
npx wrangler d1 create discord-read-receipt-db
```

表示された `database_id` を `wrangler.jsonc` に設定します。

## 3. 環境変数

`.dev.vars.example` を `.dev.vars` にコピーし、Discord Developer Portalの値を設定します。

```env
DISCORD_PUBLIC_KEY=
DISCORD_APPLICATION_ID=
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=
```

本番用シークレット：

```bash
npx wrangler secret put DISCORD_PUBLIC_KEY
npx wrangler secret put DISCORD_APPLICATION_ID
npx wrangler secret put DISCORD_BOT_TOKEN
npx wrangler secret put DISCORD_GUILD_ID
```

## 4. 型生成とDBマイグレーション

```bash
npm run cf-typegen
npm run db:migrate:local
npm run db:migrate:remote
```

## 5. デプロイ

```bash
npm run deploy
```

デプロイ後、Discord Developer Portalの **Interactions Endpoint URL** に以下を設定します。

```text
https://＜WorkerのURL＞/interactions
```

## 6. Slash Command登録

`.env` またはシェル環境変数へDiscord情報を設定してから実行します。

```bash
npm run register
```

Guild Commandとして登録するため、通常すぐ反映されます。

## 7. テスト

Discordサーバーで次を実行します。

```text
/notice-test
```

表示された「✅ 確認しました」ボタンを押すと、D1へ記録されます。

## 現時点で未実装

- 対象ユーザー・ロール・everyone指定
- 投稿時点の対象者保存
- 期限設定
- 未確認者へのDM
- Cron
- 確認率集計
- 投稿者向けステータス表示
- CSV出力

これらはボタン動作の確認後に段階的に追加します。
