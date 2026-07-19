$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [string]$Label,
    [scriptblock]$Command
  )

  Write-Host $Label
  & $Command

  if ($LASTEXITCODE -ne 0) {
    throw "$Label failed with exit code $LASTEXITCODE."
  }
}

Write-Host "== Discord Read Receipt Worker bootstrap =="

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js was not found. Install Node.js first."
}

if (-not (Test-Path "package.json")) {
  throw "package.json was not found. Run this script from the repository root."
}

Invoke-Step "[1/5] npm install" { npm install }
Invoke-Step "[2/5] Wrangler version" { npx wrangler --version }
Invoke-Step "[3/5] Cloudflare login status" { npx wrangler whoami }
Invoke-Step "[4/5] Type generation" { npm run cf-typegen }
Invoke-Step "[5/5] Type check" { npm run typecheck }

Write-Host ""
Write-Host "Bootstrap checks completed."
Write-Host "Next command: npx wrangler d1 create discord-read-receipt-db"
