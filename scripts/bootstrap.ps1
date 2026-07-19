$ErrorActionPreference = "Stop"

Write-Host "== Discord Read Receipt Worker bootstrap =="

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js が見つかりません。先に Node.js をインストールしてください。"
}

if (-not (Test-Path "package.json")) {
  throw "package.json が見つかりません。リポジトリ直下で実行してください。"
}

Write-Host "[1/5] npm install"
npm install

Write-Host "[2/5] Wrangler version"
npx wrangler --version

Write-Host "[3/5] Cloudflare login status"
npx wrangler whoami

Write-Host "[4/5] Type generation"
npm run cf-typegen

Write-Host "[5/5] Type check"
npm run typecheck

Write-Host ""
Write-Host "事前確認は完了しました。"
Write-Host "次は次のコマンドでD1を作成します。"
Write-Host "npx wrangler d1 create discord-read-receipt-db"
