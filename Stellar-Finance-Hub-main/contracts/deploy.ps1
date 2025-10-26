# Stellar Finance Hub - Contract Deployment Script (PowerShell)
# This script deploys all contracts to Stellar Testnet

Write-Host "🚀 Deploying Stellar Finance Hub Contracts to Testnet..." -ForegroundColor Cyan
Write-Host ""

# Set network
$NETWORK = "testnet"

# Deploy ReputationCore
Write-Host "📝 Deploying ReputationCore SBT Contract..." -ForegroundColor Yellow
Set-Location contracts\reputation
$REPUTATION_ID = (stellar contract deploy `
  --wasm target\wasm32v1-none\release\reputation_core.wasm `
  --source alias `
  --network $NETWORK) | Out-String
$REPUTATION_ID = $REPUTATION_ID.Trim()
Write-Host "✅ ReputationCore deployed: $REPUTATION_ID" -ForegroundColor Green
Write-Host ""

# Deploy ChitChain
Write-Host "📝 Deploying ChitChain Contract..." -ForegroundColor Yellow
Set-Location ..\chitfund
$CHITFUND_ID = (stellar contract deploy `
  --wasm target\wasm32v1-none\release\chitchain.wasm `
  --source alias `
  --network $NETWORK) | Out-String
$CHITFUND_ID = $CHITFUND_ID.Trim()
Write-Host "✅ ChitChain deployed: $CHITFUND_ID" -ForegroundColor Green
Write-Host ""

# Deploy Prediction Market
Write-Host "📝 Deploying Prediction Market Contract..." -ForegroundColor Yellow
Set-Location ..\prediction
$PREDICTION_ID = (stellar contract deploy `
  --wasm target\wasm32v1-none\release\prediction_market.wasm `
  --source alias `
  --network $NETWORK) | Out-String
$PREDICTION_ID = $PREDICTION_ID.Trim()
Write-Host "✅ Prediction Market deployed: $PREDICTION_ID" -ForegroundColor Green
Write-Host ""

# Save contract IDs to a file
Set-Location ..\..
Write-Host "💾 Saving contract IDs..." -ForegroundColor Yellow
$contractData = @{
    network = $NETWORK
    contracts = @{
        reputation = $REPUTATION_ID
        chitfund = $CHITFUND_ID
        prediction = $PREDICTION_ID
    }
    deployed_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
} | ConvertTo-Json -Depth 10

$contractData | Out-File -FilePath "contracts\deployed-contracts.json" -Encoding UTF8

Write-Host "✅ All contracts deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Contract IDs saved to: contracts\deployed-contracts.json" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contract Addresses:" -ForegroundColor Cyan
Write-Host "  ReputationCore: $REPUTATION_ID" -ForegroundColor White
Write-Host "  ChitChain:      $CHITFUND_ID" -ForegroundColor White
Write-Host "  Prediction:     $PREDICTION_ID" -ForegroundColor White
