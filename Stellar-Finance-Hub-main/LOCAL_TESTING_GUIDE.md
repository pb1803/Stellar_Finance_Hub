# 🧪 Local Testing Guide - Stellar Finance Hub

## ✅ Servers Status
- **Backend**: Running on `http://localhost:3001`
- **Frontend**: Running on `http://localhost:3000`

---

## 🎯 Testing the Arbitrage Agent

The AI Arbitrage Agent is **ready and running automatically**! Here's how to verify:

### Step 1: Open the Dashboard
1. Navigate to: **http://localhost:3000/dashboard**
2. Connect your Freighter wallet (if not already connected)

### Step 2: Open Browser Console
- Press **F12** (or Ctrl+Shift+I)
- Click the **Console** tab

### Step 3: Navigate to Arbitrage Tab
- Click the **"Arbitrage"** tab in the dashboard
- Look for the green **"● Monitoring Active"** indicator

### Step 4: Verify Agent Logs
You should see these console logs appearing every ~30 seconds:

```
🤖 Starting arbitrage agent with 30000ms interval...
🔍 Scanning for arbitrage opportunities...
💰 Found 3 arbitrage opportunities
```

### What the Agent Does:
- ✅ **Auto-starts** when you open the Arbitrage tab
- ✅ **Scans DEXs** (StellarX, Aquarius) every 30 seconds
- ✅ **Finds price differences** across exchanges
- ✅ **Calculates profit** after 0.3% trading fees
- ✅ **Filters opportunities** (only shows >0.5% profit)
- ✅ **Assigns confidence scores** based on volume & spread

---

## 🧪 Full Project Testing Checklist

### 1. **Wallet Connection**
- [ ] Freighter wallet icon appears in top-right corner
- [ ] Public key displays after connection (starts with `G...`)
- [ ] "Connected" status shows in green

### 2. **Reputation Tab** 🏆
- [ ] Current reputation score displays (default: 0)
- [ ] Click **"Test +10 Points"** button
- [ ] See loading state: "Updating reputation on-chain..."
- [ ] If contracts not deployed: Falls back to mock API (✓ working)
- [ ] If contracts deployed: Freighter popup asks for transaction signature

### 3. **Chit Funds Tab** 💰
- [ ] Form has fields: Fund Name, Pledge Amount, Cycle Length
- [ ] Fill form: Name="Test Fund", Amount=100, Cycle=30
- [ ] Click **"Create Chit Fund"**
- [ ] See loading: "Creating on-chain..."
- [ ] Without deployed contracts: Mock API returns success (✓ working)
- [ ] With deployed contracts: Freighter prompts for signature

### 4. **Prediction Markets Tab** 🎲
- [ ] Create Market form visible
- [ ] Fill: Question="Will BTC hit $100k?", Amount=50
- [ ] Click **"Create Market"**
- [ ] Mock markets list displays below
- [ ] Try clicking **"Stake YES"** or **"Stake NO"** on a market
- [ ] Verify loading states work

### 5. **Arbitrage Tab** 🤖 (Most Important!)
- [ ] Green "● Monitoring Active" indicator shows at top
- [ ] List of arbitrage opportunities displays
- [ ] Each opportunity shows:
  - Trading pair (e.g., XLM/USDC)
  - Buy/Sell exchanges
  - Profit percentage and USDC amount
  - Confidence level (High/Medium/Low)
- [ ] Click **"Simulate Trade"** on any opportunity
- [ ] See simulation results:
  - Estimated Profit: X.XX USDC (Y.YY%)
  - Gas Fees: ~0.0001 XLM
  - Net Profit after fees
- [ ] Refresh automatically every 30 seconds
- [ ] Open console (F12) to see agent logs

### 6. **Backend API Check**
Open these URLs in your browser to verify backend:

```
http://localhost:3001/api/reputation
http://localhost:3001/api/chitfund
http://localhost:3001/api/prediction
http://localhost:3001/api/arbitrage
```

Each should return JSON data (mock data for now).

---

## 🎨 What You Should See

### Dashboard Overview
```
┌─────────────────────────────────────────────┐
│  Stellar Finance Hub        🦊 Connected    │
├─────────────────────────────────────────────┤
│  [Reputation] [Chit Funds] [Prediction] [Arbitrage] │
├─────────────────────────────────────────────┤
│                                             │
│  ● Monitoring Active  🔄 Auto-refresh: 30s │
│                                             │
│  💎 Arbitrage Opportunities (3)            │
│  ┌───────────────────────────────────────┐ │
│  │ XLM/USDC                              │ │
│  │ Buy: StellarX → Sell: Aquarius       │ │
│  │ Profit: +2.45% (122.50 USDC)         │ │
│  │ Confidence: ⭐⭐⭐ HIGH               │ │
│  │ [Simulate Trade] [Execute]            │ │
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### Console Logs (Every 30s)
```
🤖 Starting arbitrage agent with 30000ms interval...
🔍 Scanning for arbitrage opportunities...
📊 Fetched prices from 3 DEXs
💡 Analyzing 5 trading pairs...
✅ Found profitable opportunity: XLM/USDC (+2.45%)
✅ Found profitable opportunity: XLM/BTC (+1.89%)
✅ Found profitable opportunity: USDC/AQUA (+1.23%)
💰 Total: 3 arbitrage opportunities
```

---

## 🚀 What's Working RIGHT NOW

### ✅ Fully Functional (Mock Data):
1. **Arbitrage Agent** - Real-time monitoring with 30s intervals
2. **All 4 Dashboard Tabs** - UI, forms, buttons, loading states
3. **Backend APIs** - Express server returning mock data
4. **Wallet Integration** - Freighter connects and shows public key
5. **Hybrid Approach** - Tries contracts, falls back to API gracefully

### ⏳ Pending (Needs Contract Deployment):
1. **Real On-Chain Transactions** - Currently using mock responses
2. **Freighter Signing** - Will prompt when contracts are deployed
3. **Contract Interactions** - Will execute when contract IDs are set

---

## 🔧 How It Currently Works

**Without Deployed Contracts (NOW):**
```
User Action → Frontend → Backend Mock API → Returns Mock Data
            ↓
    Arbitrage Agent → Scans DEXs → Shows Opportunities
```

**After Contract Deployment (NEXT):**
```
User Action → Frontend → Contract Client → Freighter Sign → Stellar Testnet
            ↓
    Arbitrage Agent → Real DEX APIs → Execute Trades
```

---

## 🎯 Testing Results Expected

### Current State (Mock):
- ✅ All tabs load without errors
- ✅ Forms submit successfully
- ✅ Arbitrage agent shows 3 opportunities
- ✅ Simulate trade shows profit calculations
- ✅ Console logs appear every 30 seconds
- ✅ No crashes or broken UI

### After Deployment (Real):
- 🔜 Freighter popup asks for signatures
- 🔜 Transactions go to Stellar Testnet
- 🔜 Real contract state updates
- 🔜 Transaction hashes returned
- 🔜 Gas fees deducted from wallet

---

## 🐛 Common Issues & Fixes

### Issue: "Monitoring Active" not showing
**Fix**: Refresh the page, agent auto-starts on component mount

### Issue: No console logs appearing
**Fix**: 
1. Open DevTools (F12)
2. Navigate to Arbitrage tab
3. Wait 30 seconds for first scan

### Issue: Wallet not connecting
**Fix**:
1. Install Freighter extension
2. Create/import wallet
3. Enable localhost access in Freighter settings

### Issue: "Contract not found" errors
**Fix**: This is expected! Contracts aren't deployed yet. App falls back to mock API automatically.

---

## 📝 Next Steps After Testing

1. ✅ **Verify** - Confirm agent logs appear in console
2. ✅ **Test** - Click through all 4 tabs
3. ✅ **Simulate** - Try simulation on arbitrage opportunities
4. 🚀 **Deploy** - Run contract deployment scripts
5. ⚙️ **Configure** - Update `.env.local` with contract IDs
6. 🎉 **Go Live** - Test with real on-chain transactions!

---

## 🎊 Ready to Deploy?

Once you've verified everything works locally with mock data, run:

```powershell
cd stellar-finance-hub/contracts
./deploy.ps1
```

This will:
1. Generate testnet account
2. Fund it with test XLM
3. Deploy all 3 contracts
4. Save contract IDs to `deployed-contracts.json`

Then update `frontend/.env.local` with the contract IDs and restart the frontend!

---

**🔥 The arbitrage agent is LIVE and ready to test right now!**  
Open http://localhost:3000/dashboard and check the Arbitrage tab! 🚀
