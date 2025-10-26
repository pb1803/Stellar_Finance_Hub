#!/bin/bash

# Stellar Finance Hub - Contract Deployment Script
# This script deploys all contracts to Stellar Testnet

echo "🚀 Deploying Stellar Finance Hub Contracts to Testnet..."
echo ""

# Set network
NETWORK="testnet"

# Deploy ReputationCore
echo "📝 Deploying ReputationCore SBT Contract..."
cd contracts/reputation
REPUTATION_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/reputation_core.wasm \
  --source alias \
  --network $NETWORK)
echo "✅ ReputationCore deployed: $REPUTATION_ID"
echo ""

# Deploy ChitChain
echo "📝 Deploying ChitChain Contract..."
cd ../chitfund
CHITFUND_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/chitchain.wasm \
  --source alias \
  --network $NETWORK)
echo "✅ ChitChain deployed: $CHITFUND_ID"
echo ""

# Deploy Prediction Market
echo "📝 Deploying Prediction Market Contract..."
cd ../prediction
PREDICTION_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/prediction_market.wasm \
  --source alias \
  --network $NETWORK)
echo "✅ Prediction Market deployed: $PREDICTION_ID"
echo ""

# Save contract IDs to a file
cd ../..
echo "💾 Saving contract IDs..."
cat > contracts/deployed-contracts.json << EOF
{
  "network": "$NETWORK",
  "contracts": {
    "reputation": "$REPUTATION_ID",
    "chitfund": "$CHITFUND_ID",
    "prediction": "$PREDICTION_ID"
  },
  "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "✅ All contracts deployed successfully!"
echo ""
echo "📋 Contract IDs saved to: contracts/deployed-contracts.json"
echo ""
echo "Contract Addresses:"
echo "  ReputationCore: $REPUTATION_ID"
echo "  ChitChain:      $CHITFUND_ID"
echo "  Prediction:     $PREDICTION_ID"
