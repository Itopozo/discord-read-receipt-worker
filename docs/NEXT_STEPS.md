# 次の作業チェックリスト

更新日: 2026-07-19

## こちらで完了済み

- Worker実装
- Discord署名検証
- `/notice-test`
- 確認ボタン
- D1保存処理
- マイグレーション
- Slash Command登録スクリプト
- README
- 作業記録
- PowerShell事前確認スクリプト

## ユーザー環境で必要な操作

CloudflareおよびDiscordアカウントへの認証が必要なため、以下だけはユーザー環境で実行します。

### 1. リポジトリ取得

```powershell
git clone https://github.com/Itopozo/discord-read-receipt-worker.git
cd discord-read-receipt-worker
```

既に取得済みの場合は次で更新します。

```powershell
git pull
```

### 2. 事前確認

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap.ps1
```

### 3. D1作成

```powershell
npx wrangler d1 create discord-read-receipt-db
```

表示された `database_id` を `wrangler.jsonc` の
`REPLACE_WITH_D1_DATABASE_ID` と置き換えます。

### 4. Discord情報登録

必要な値:

- Application ID
- Public Key
- Bot Token
- Guild ID

本番シークレット登録:

```powershell
npx wrangler secret put DISCORD_PUBLIC_KEY
npx wrangler secret put DISCORD_APPLICATION_ID
npx wrangler secret put DISCORD_BOT_TOKEN
npx wrangler secret put DISCORD_GUILD_ID
```

### 5. D1反映とデプロイ

```powershell
npm run db:migrate:remote
npm run deploy
```

### 6. Discord設定

Discord Developer Portalの `Interactions Endpoint URL` に設定:

```text
https://＜Worker URL＞/interactions
```

Slash Command登録:

```powershell
$env:DISCORD_APPLICATION_ID="..."
$env:DISCORD_BOT_TOKEN="..."
$env:DISCORD_GUILD_ID="..."
npm run register
```

### 7. 動作確認

Discordで実行:

```text
/notice-test
```

確認ボタンを押し、本人だけに「確認を記録しました」と表示されれば成功です。
