$ErrorActionPreference = "Stop"

Write-Host "== Discord Read Receipt Worker bootstrap =="

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js was not found. Install Node.js first."
}

if (-not (Test-Path "package.json")) {
  throw "package.json was not found. Run this script from the repository root."
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
Write-Host "Bootstrap checks completed."
Write-Host "Next command: npx wrangler d1 create discord-read-receipt-db"
