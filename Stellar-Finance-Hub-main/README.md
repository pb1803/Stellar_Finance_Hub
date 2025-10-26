# Stellar Finance Hub - MVP

A decentralized finance hub built on Stellar for chit funds, prediction markets, AI arbitrage, and on-chain reputation.

## 🏗️ Project Structure

```
stellar-finance-hub/
├── backend/          # Express API server with mock endpoints
├── frontend/         # Next.js + TypeScript + Tailwind UI
├── contracts/        # Soroban smart contracts (coming soon)
└── docs/            # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Freighter wallet extension (for wallet connection)

### 1. Start Backend Server

```bash
cd backend
npm install
node server.js
```

The backend will run on **http://localhost:3001**

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on **http://localhost:3000**

## 🎯 Features

### ✅ Implemented (MVP Demo)

- **Wallet Connection**: Connect/disconnect Freighter wallet
- **Dashboard UI**: Dark-themed responsive layout with 4 tabs
- **Chit Funds**:
  - View all active chit funds
  - Create new funds (name, pledge amount, cycle length)
  - Join existing funds
- **Prediction Markets**:
  - View all prediction markets
  - Create new markets with custom questions and outcomes
  - Stake on outcomes
  - Visual representation of odds/stakes
- **AI Arbitrage**:
  - View AI-generated arbitrage suggestions
  - Confidence scores and expected profits
  - Simulate auto-trades
- **On-Chain Reputation**:
  - View reputation score (0-1000)
  - Activity history with score deltas
  - Visual progress indicators

### 🔄 Using Mock Data

All backend endpoints currently return in-memory mock data. This allows the MVP to be fully functional for demos without requiring deployed smart contracts.

## 📡 API Endpoints

### Chit Funds
- `GET /api/chit-funds` - List all funds
- `POST /api/chit-funds` - Create or join a fund
  ```json
  {
    "action": "create",
    "account": "G...",
    "name": "My Fund",
    "pledgedAmount": 5000,
    "cycleLength": 30
  }
  ```

### Prediction Markets
- `GET /api/predictions` - List all markets
- `POST /api/predictions` - Create or stake
  ```json
  {
    "action": "stake",
    "account": "G...",
    "marketId": "pm-1",
    "outcome": "Yes",
    "amount": 100
  }
  ```

### Arbitrage
- `GET /api/arbitrage` - Get AI suggestions
- `POST /api/arbitrage/simulate` - Simulate trade
  ```json
  {
    "suggestionId": "arb-1",
    "account": "G..."
  }
  ```

### Reputation
- `GET /api/reputation/:account` - Get reputation data
- `POST /api/reputation` - Update reputation
  ```json
  {
    "account": "G...",
    "action": "Joined Chit Fund",
    "delta": 50
  }
  ```

## 🎨 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Blockchain**: Stellar (Freighter wallet), Soroban (smart contracts - planned)
- **State Management**: React hooks

## 🧪 Testing the MVP

1. **Open http://localhost:3000** in your browser
2. The app will redirect to `/dashboard`
3. **Connect Wallet**: 
   - Click "Connect Wallet" in the top right
   - Approve the Freighter popup (if installed)
4. **Try Each Tab**:
   - **Chit Fund**: Create a fund or join an existing one
   - **Prediction**: Create a market or stake on outcomes
   - **Arbitrage**: View suggestions and simulate trades
   - **Reputation**: See your score and activity history

### Without Freighter
The app will show a warning if Freighter is not detected. You can still view the UI and data, but wallet-required actions (create, join, stake) will be disabled.

## 📝 Notes

- **Mock Data**: All data is stored in-memory on the backend. Restarting the backend resets data.
- **Wallet Addresses**: The backend uses placeholder addresses (e.g., `GXXXXEXAMPLE1`). When connected, your real Freighter address will be used for new actions.
- **Smart Contracts**: Soroban contracts are planned but not required for the MVP demo.

## 🔮 Future Enhancements

- Deploy Soroban smart contracts for chit funds and reputation
- Real Stellar transactions (staking, joining, creating)
- Blend Protocol integration for yield generation
- Persistent storage (database)
- Real AI arbitrage engine
- Oracle integration for prediction market resolution
- Mobile-responsive improvements
- Unit and integration tests

## 🐛 Troubleshooting

### Backend won't start
- Make sure port 3001 is free
- Check that dependencies are installed: `cd backend && npm install`

### Frontend build errors
- Delete `.next` folder and restart: `rm -rf .next && npm run dev`
- Ensure Node.js 18+ is installed

### Wallet connection issues
- Install Freighter: https://www.freighter.app/
- Make sure you're using a Chromium-based browser (Chrome, Edge, Brave)

## 👥 Team

Built for a hackathon with ❤️ by the Stellar Finance Hub team.

## 📄 License

MIT
