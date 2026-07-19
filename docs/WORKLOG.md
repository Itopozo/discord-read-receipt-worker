# 作業記録

最終更新: 2026-07-19

## 目的

Discord上の重要なお知らせについて、リアクションではなく「確認しました」ボタンで確認状況を管理するBotを作る。

## 採用構成

- Discord Interactions
- Cloudflare Workers
- Cloudflare D1
- GitHub管理
- 常時起動サーバーなし

## 現在までに実施したこと

### 1. 要件整理

- 確認ボタンをDiscordメッセージ下部に表示
- ボタン押下時にユーザーIDと確認日時を保存
- 二重押下を判定
- 押下結果は本人だけに表示
- 将来的にユーザー・ロール・everyone指定に対応
- 投稿時点の対象者一覧をDBへ保存する方針
- 将来的に期限、未確認者DM、確認率集計、CSV出力を追加

### 2. GitHubリポジトリ作成

リポジトリ:

- `Itopozo/discord-read-receipt-worker`

### 3. 初期MVP実装

以下を追加済み。

- `src/index.ts`
  - Discord Interaction署名検証
  - PING応答
  - `/notice-test` の処理
  - 確認ボタン押下処理
  - D1への確認記録
  - 二重押下判定
- `migrations/0001_initial.sql`
  - noticesテーブル
  - confirmationsテーブル
- `scripts/register-commands.ts`
  - Guild Slash Command登録
- `wrangler.jsonc`
  - Worker設定
  - D1 Binding設定
  - Observability有効化
- `package.json`
  - 開発、デプロイ、型生成、DB移行、コマンド登録用スクリプト
- `.dev.vars.example`
  - Discord関連の設定項目例
- `README.md`
  - 初期セットアップ手順

## 現在のテスト動作

Discordで以下を実行する。

```text
/notice-test
```

表示される内容:

```text
📢 テストのお知らせ

これは確認ボタンの表示テストです。
内容を確認したら、下のボタンを押してください。

[ ✅ 確認しました ]
```

押下時:

- 初回: `✅ 確認を記録しました。`
- 二回目以降: `✅ すでに確認済みです。`

どちらも押した本人だけに表示される。

## 未実施

- Cloudflare D1作成
- `wrangler.jsonc` へのdatabase_id設定
- Discord Application作成・設定
- Cloudflare Secrets登録
- Workerデプロイ
- Interactions Endpoint URL設定
- Slash Command登録
- Discord実機テスト

## 次の作業

1. PCへリポジトリをclone
2. `npm install`
3. D1作成
4. Discord Application/Bot設定
5. Secrets登録
6. DB Migration
7. Workerデプロイ
8. Interactions Endpoint URL設定
9. `/notice-test` 登録
10. Discord上でボタン動作確認
