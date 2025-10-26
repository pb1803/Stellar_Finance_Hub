# Stellar Finance Hub - Frontend ↔ Contract Integration Guide

## ✅ What's Integrated:

### 1. **Contract Clients** (`lib/stellar/contracts/`)
- ✅ **ReputationContract** - Get/update reputation scores
- ✅ **ChitFundContract** - Create/join/contribute to chit funds
- ✅ **PredictionMarketContract** - Create/stake/resolve prediction markets

### 2. **Blend Protocol** (`lib/blend/`)
- ✅ Lending pool integration
- ✅ Supply/borrow/repay/withdraw functions
- ✅ Health factor calculation
- ✅ APY calculations

### 3. **Arbitrage Agent** (`lib/arbitrage/`)
- ✅ Real-time DEX price monitoring
- ✅ Arbitrage opportunity detection
- ✅ Profit calculations with fees
- ✅ Confidence scoring
- ✅ Trade simulation

---

## 🚀 Next Steps:

### Step 1: Deploy Contracts to Testnet

```powershell
cd E:\algo\stellar-finance-hub\contracts

# Generate identity if not exists
stellar keys generate alice --network testnet --fund

# Deploy all contracts
.\deploy.ps1
```

This will create `contracts/deployed-contracts.json` with contract IDs.

### Step 2: Update Frontend Environment

Copy contract IDs from `deployed-contracts.json` to frontend:

```powershell
cd ..\frontend
cp .env.local.example .env.local
```

Edit `.env.local` and add contract IDs:
```env
NEXT_PUBLIC_REPUTATION_CONTRACT=C...
NEXT_PUBLIC_CHITFUND_CONTRACT=C...
NEXT_PUBLIC_PREDICTION_CONTRACT=C...
```

### Step 3: Update Dashboard Tabs

Each tab needs to be updated to use real contract clients instead of mock APIs:

#### **ReputationTab** (`app/dashboard/tabs/ReputationTab.tsx`)
```typescript
import { ReputationContract } from '@/lib/stellar/contracts/reputation';
import { CONTRACTS } from '@/lib/stellar/config';

const reputationContract = new ReputationContract(CONTRACTS.REPUTATION);

// Get reputation
const score = await reputationContract.getReputation(account);

// Update reputation
await reputationContract.increment(account, 10);
```

#### **ChitTab** (`app/dashboard/tabs/ChitTab.tsx`)
```typescript
import { ChitFundContract } from '@/lib/stellar/contracts/chitfund';
import { CONTRACTS } from '@/lib/stellar/config';

const chitFundContract = new ChitFundContract(CONTRACTS.CHITFUND);

// Create fund
await chitFundContract.createFund(account, BigInt(1000), 30, 10);

// Join fund
await chitFundContract.joinFund(fundId, account);
```

#### **PredictionTab** (`app/dashboard/tabs/PredictionTab.tsx`)
```typescript
import { PredictionMarketContract } from '@/lib/stellar/contracts/prediction';
import { CONTRACTS } from '@/lib/stellar/config';

const predictionContract = new PredictionMarketContract(CONTRACTS.PREDICTION);

// Create market
await predictionContract.createMarket(account, questionHash, endTime);

// Stake
await predictionContract.stake(marketId, account, BigInt(100), true);
```

#### **ArbitrageTab** (`app/dashboard/tabs/ArbitrageTab.tsx`)
```typescript
import { arbitrageAgent } from '@/lib/arbitrage';

// Start monitoring
useEffect(() => {
  arbitrageAgent.start(30000); // Scan every 30 seconds
  return () => arbitrageAgent.stop();
}, []);

// Get opportunities
const opportunities = arbitrageAgent.getTopOpportunities(5);

// Execute trade
await arbitrageAgent.executeTrade(opportunityId, account);
```

### Step 4: Add Blend Protocol Tab

Create new tab `app/dashboard/tabs/BlendTab.tsx`:

```typescript
import { blendProtocol } from '@/lib/blend';

// Get pools
const pools = await blendProtocol.getPools();

// Supply to pool
await blendProtocol.supply(account, 'usdc-pool', BigInt(1000));

// Get user position
const position = await blendProtocol.getUserPosition(account);
```

---

## 📁 File Structure:

```
frontend/
├── lib/
│   ├── stellar/
│   │   ├── config.ts              # Network config & contract IDs
│   │   └── contracts/
│   │       ├── reputation.ts       # Reputation contract client
│   │       ├── chitfund.ts        # ChitFund contract client
│   │       └── prediction.ts      # Prediction contract client
│   ├── blend/
│   │   └── index.ts               # Blend Protocol integration
│   └── arbitrage/
│       └── index.ts               # Arbitrage Agent
├── app/
│   └── dashboard/
│       └── tabs/
│           ├── ReputationTab.tsx   # Update to use contract
│           ├── ChitTab.tsx         # Update to use contract
│           ├── PredictionTab.tsx   # Update to use contract
│           ├── ArbitrageTab.tsx    # Update to use agent
│           └── BlendTab.tsx        # New: Blend Protocol UI
└── .env.local                     # Contract IDs (create from example)
```

---

## 🧪 Testing Integration:

1. **Deploy contracts first**
2. **Update .env.local with real contract IDs**
3. **Restart frontend**: `npm run dev`
4. **Connect Freighter wallet**
5. **Test each tab**:
   - Reputation: Check score, increment/decrement
   - Chit Fund: Create fund, join, contribute
   - Prediction: Create market, stake, check odds
   - Arbitrage: View opportunities, simulate trade

---

## 🔧 Current State:

- ✅ Contract clients created
- ✅ Blend Protocol integration ready
- ✅ Arbitrage Agent implemented
- ⏳ Contracts not deployed yet (run `deploy.ps1`)
- ⏳ Dashboard tabs using mock data (update after deployment)
- ⏳ .env.local needs contract IDs

---

## 💡 Quick Commands:

```powershell
# Deploy contracts
cd contracts; .\deploy.ps1

# Update frontend env
cd ..\frontend
cp .env.local.example .env.local
# Edit .env.local with contract IDs

# Restart frontend
npm run dev

# Test in browser
# http://localhost:3000/dashboard
```

---

## 📚 Resources:

- **Soroban Docs**: https://soroban.stellar.org/docs
- **Stellar SDK**: https://stellar.github.io/js-stellar-sdk/
- **Freighter API**: https://docs.freighter.app/
- **Blend Protocol**: https://blend.capital

---

Ready to deploy contracts? Run `cd contracts; .\deploy.ps1` 🚀
