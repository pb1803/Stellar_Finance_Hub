# Stellar Finance Hub - Smart Contracts

This directory contains all Soroban smart contracts for the Stellar Finance Hub platform.

## 📁 Contract Structure

```
contracts/
├── reputation/          # ReputationCore SBT Contract
├── chitfund/           # ChitChain Contract  
├── prediction/         # Prediction Market Contract
├── deploy.ps1          # PowerShell deployment script
├── deploy.sh           # Bash deployment script
└── deployed-contracts.json  # Deployed contract IDs (generated)
```

## 🔨 Built Contracts

### 1. **ReputationCore SBT** (`reputation-core`)
**Location:** `reputation/contracts/reputation-core/`  
**WASM:** `reputation/target/wasm32v1-none/release/reputation_core.wasm`

**Functions:**
- `initialize()` - Initialize the contract
- `get_reputation(account)` - Get reputation score (0-1000, default 500)
- `update_reputation(account, delta)` - Update reputation (+/-)
- `get_reputation_data(account)` - Get full reputation data
- `increment(account, amount)` - Increase reputation
- `decrement(account, amount)` - Decrease reputation
- `meets_threshold(account, threshold)` - Check if meets minimum score

**Use Cases:**
- Soulbound token (non-transferable)
- Track user reputation across all platform activities
- Gate access to premium features based on reputation
- Reward good behavior, penalize bad actors

---

### 2. **ChitChain** (`chitchain`)
**Location:** `chitfund/contracts/chitchain/`  
**WASM:** `chitfund/target/wasm32v1-none/release/chitchain.wasm`

**Functions:**
- `create_fund(creator, contribution, cycle_length, max_members)` - Create new chit fund
- `join_fund(fund_id, member)` - Join existing fund
- `contribute(fund_id, contributor, amount)` - Make contribution
- `distribute(fund_id, recipient)` - Distribute pot to member
- `get_fund(fund_id)` - Get fund details
- `get_member(fund_id, member)` - Get member details
- `start_fund(fund_id)` - Activate the fund
- `complete_fund(fund_id)` - Mark fund as completed

**Use Cases:**
- Community savings pools (Rotating Savings and Credit Associations)
- Group lending and borrowing
- Collective investment funds
- Mutual aid networks

---

### 3. **Prediction Market** (`prediction-market`)
**Location:** `prediction/contracts/prediction-market/`  
**WASM:** `prediction/target/wasm32v1-none/release/prediction_market.wasm`

**Functions:**
- `create_market(creator, question, end_time)` - Create new prediction market
- `stake(market_id, staker, amount, position)` - Stake on YES or NO
- `resolve(market_id, outcome)` - Resolve market (creator only)
- `claim(market_id, staker)` - Claim winnings
- `get_market(market_id)` - Get market details
- `get_stake(market_id, staker)` - Get stake details
- `get_odds(market_id)` - Get current YES odds (percentage * 100)

**Use Cases:**
- Decentralized prediction markets
- Information discovery through crowd wisdom
- Hedging and risk management
- Event outcome betting

---

## 🚀 Deployment

### Prerequisites
1. **Stellar CLI installed** (you already have it ✅)
2. **Freighter wallet** with Testnet account funded
3. **Identity configured:**
   ```powershell
   stellar keys generate alice --network testnet --fund
   ```

### Deploy All Contracts

**Option 1: PowerShell (Windows)**
```powershell
cd E:\algo\stellar-finance-hub\contracts
.\deploy.ps1
```

**Option 2: Manual Deployment**
```powershell
# Deploy ReputationCore
cd reputation
stellar contract deploy `
  --wasm target\wasm32v1-none\release\reputation_core.wasm `
  --source alice `
  --network testnet

# Deploy ChitChain
cd ..\chitfund
stellar contract deploy `
  --wasm target\wasm32v1-none\release\chitchain.wasm `
  --source alice `
  --network testnet

# Deploy Prediction Market
cd ..\prediction
stellar contract deploy `
  --wasm target\wasm32v1-none\release\prediction_market.wasm `
  --source alice `
  --network testnet
```

### Deploy to Futurenet (for Soroban experimental features)
```powershell
stellar contract deploy `
  --wasm target\wasm32v1-none\release\reputation_core.wasm `
  --source alice `
  --network futurenet
```

---

## 🧪 Testing

Each contract includes unit tests. Run them with:

```powershell
# Test ReputationCore
cd reputation\contracts\reputation-core
cargo test

# Test ChitChain
cd ..\..\..\chitfund\contracts\chitchain
cargo test

# Test Prediction Market
cd ..\..\..\prediction\contracts\prediction-market
cargo test
```

---

## 🔗 Integration with Frontend

After deployment, update `frontend/.env.local` with contract IDs:

```env
NEXT_PUBLIC_REPUTATION_CONTRACT=<reputation_contract_id>
NEXT_PUBLIC_CHITFUND_CONTRACT=<chitfund_contract_id>
NEXT_PUBLIC_PREDICTION_CONTRACT=<prediction_contract_id>
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

---

## 📝 Contract IDs

After running `deploy.ps1`, contract IDs will be saved to:
```
contracts/deployed-contracts.json
```

Format:
```json
{
  "network": "testnet",
  "contracts": {
    "reputation": "C...",
    "chitfund": "C...",
    "prediction": "C..."
  },
  "deployed_at": "2025-10-26T..."
}
```

---

## 🔧 Rebuild Contracts

If you make changes to contract code:

```powershell
# Rebuild all
cd E:\algo\stellar-finance-hub\contracts

cd reputation
stellar contract build

cd ..\chitfund
stellar contract build

cd ..\prediction
stellar contract build
```

---

## 📚 Learn More

- **Soroban Docs**: https://soroban.stellar.org/docs
- **Stellar CLI**: https://developers.stellar.org/docs/tools/developer-tools
- **Contract Examples**: https://github.com/stellar/soroban-examples

---

## ✅ Status

- [x] ReputationCore SBT - Built ✅
- [x] ChitChain - Built ✅
- [x] Prediction Market - Built ✅
- [ ] Deployed to Testnet (run `deploy.ps1`)
- [ ] Integrated with Frontend
- [ ] Arbitrage Agent (off-chain service)
