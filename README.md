# Stellar Finance Hub — Unified DeFi on Stellar

Tagline: Empowering community finance and market efficiency with Soroban smart contracts and Stellar’s low-cost settlement.

---

## 1) Project Title

Stellar Finance Hub

## 2) Tagline

Composable DeFi primitives — Chit funds, Prediction markets, Reputation SBTs, and Arbitrage tooling — built on Soroban and Stellar for fast, low-fee real-world finance.

## 3) Project Description

Problem solved
- Many community finance and prediction use-cases today rely on manual coordination and centralized services which are fragile, costly and opaque.
- Arbitrage and market-making require ultra-fast settlement with minimal fees.

What this project does
- Combines Soroban smart contracts and on-chain state with off-chain detection/agents to deliver four composable modules:
  - Chit Funds (cooperative savings/payouts)
  - Prediction Markets (on-chain bets & payouts)
  - Reputation (SBT-like on-chain reputational scoring)
  - Arbitrage tooling (off-chain detection + on-chain settlement hooks)

Target users
- Hackathon judges and demo viewers
- DeFi builders and community treasuries
- Traders and market analysts interested in low-fee settlement

Key features (MVP)
- Soroban contracts for Chit, Prediction and Reputation
- Frontend integration (Next.js + Freighter) for wallet-based signing
- Off-chain arbitrage detector and mock execution flow
- Deploy script to publish WASM contracts to Soroban testnet

## 4) Motivation

Why we built it
- We wanted to demonstrate how lightweight on-chain primitives (Soroban) and Stellar’s low fees enable real financial primitives for everyday communities and traders.

Hackathon relevance
- Integrates core blockchain concepts (contracts, oracles, wallets) into an end-to-end developer/demo stack with a clear user flow and measurable outcomes — ideal for a hackathon pitch.

Personal pain points solved
- Reduces manual trust for pooled savings (chit funds)
- Replaces centralized settlement for prediction markets with verifiable on-chain logic
- Provides a fast, low-cost foundation for arbitrage settlement

## 5) Demo / Screenshots / GIFs

Insert 2–3 visuals here (screenshots / demo gifs):

- ![Dashboard Screenshot](./assets/demo-dashboard.png) — placeholder
- ![Create Fund Flow](./assets/demo-create-fund.png) — placeholder
- GIF: assets/demo-flow.gif — placeholder showing: Connect Wallet → Create Market → Stake → See TX confirmation

## 6) Tech Stack

- Frontend: Next.js (App Router), React, TypeScript
- Wallet integration: Freighter (@stellar/freighter-api / window.freighterApi)
- Blockchain: Stellar (Soroban smart contracts / WASM), Soroban RPC, Horizon
- Smart contracts: Rust (Soroban contracts in contracts/*)
- SDKs & libs: @stellar/stellar-sdk, Soroban RPC, Node/Express for backend mocks
- Backend: Node.js, Express (demo APIs & mock stores)
- Off-chain agents: TypeScript arbitrage agent + Python AI arbitrage detectors in stablecoin_arbitrage/
- Dev tools: npm, Node, Cargo (Rust toolchain), PowerShell deployment script for contracts

## 7) Features (Detailed)

- Chit Funds (on-chain)
  - Create a pooled savings fund on Soroban
  - Join a fund and contribute with deterministic contract rules
  - Read-only simulation of fund state (via Soroban simulate)

- Prediction Markets (on-chain)
  - Create binary markets, stake, query odds
  - Resolve markets (demo uses off-chain resolution; production needs oracle)

- Reputation (on-chain)
  - SBT-style score storage and update via Soroban contract
  - Read reputation for gating or incentive decisions in other contracts

- Arbitrage (off-chain + settlement hooks)
  - Off-chain agent scans DEXs (mocked) for opportunities
  - Simulated execution flow that demonstrates building and signing transactions

- UX & Developer features
  - Freighter wallet onboarding + sign flow (useFreighter.ts and useStellarDapp.ts hooks)
  - Contract clients for each module (frontend/lib/contracts/*.ts) that prepare/simulate/sign/send
  - Deploy script for contracts: contracts/deploy.ps1

## 8) Architecture / Flow

Top-level flow (one-line): Frontend (user) → Prepare Soroban transaction via Soroban RPC → Wallet signs (Freighter) → Submit signed XDR to Horizon/Soroban → Contract state updated → UI polls for result.

Suggested diagram placeholder:

![Architecture Diagram](./assets/architecture.png)

Sequence for an on-chain action (example: Create Chit Fund)
1. User connects Freighter wallet in the browser.
2. Frontend calls ChitFundClient.createFund() which uses Soroban RPC to getAccount and prepareTransaction().
3. Frontend sends prepared XDR to Freighter for signing.
4. Signed XDR is submitted via server.sendTransaction() to Soroban/Horizon.
5. Frontend reads result (PENDING / SUCCESS) and updates UI.

## 9) Installation / Setup

Prerequisites
- Node.js >= 18, npm
- Rust toolchain + cargo (to build Soroban contracts)
- Freighter browser extension for signing (demo)

Quick start (Windows PowerShell)

1) Clone repository

powershell
git clone https://github.com/pb1803/Algoholics.git
cd Algoholics


2) Run backend (demo API)

powershell
cd Stellar-Finance-Hub-main/backend
npm install
node server.js
# or if package.json has dev script: npm run dev


3) Run frontend (Next.js)

powershell
cd ..\frontend
npm install
npm run dev
# Open http://localhost:3000


4) (Optional) Build & deploy Soroban contracts to testnet

Requirements: Soroban/stellar CLI tool installed and funded test accounts.

powershell
cd ..\contracts
# Example: run the bundled PowerShell deploy script (this invokes `stellar contract deploy`)
.\deploy.ps1


Environment variables (place in .env.local for frontend)

- NEXT_PUBLIC_STELLAR_NETWORK=testnet
- NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
- NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
- NEXT_PUBLIC_REPUTATION_CONTRACT=<reputation-contract-id>
- NEXT_PUBLIC_CHITFUND_CONTRACT=<chit-contract-id>
- NEXT_PUBLIC_PREDICTION_CONTRACT=<prediction-contract-id>

Notes
- If you do not have contracts deployed, the frontend includes mock contract IDs and mock RPC helpers for development.

## 10) Usage

User flows
- Connect Freighter wallet from the top-right of the app.
- Chit Fund: Create a fund → Invite members → Members sign contributions → Track pot and payouts.
- Prediction: Create a market → Users stake on an outcome → Resolve market with oracle (demo uses backend mock).
- Reputation: Read and update reputation via on-chain calls, visible in profile pages.
- Arbitrage: Open the arbitrage tab to view detected opportunities and run a simulated execution.

CLI / developer commands
- npm run dev in frontend — start Next dev server
- node server.js in backend — start demo APIs
- .\contracts\deploy.ps1 — deploy contracts to testnet (PowerShell)

## 11) Future Enhancements

- Oracle integration for secure, decentralized market resolution (Chainlink-like or multisig oracles).
- Relayer + SEP-10 auth to allow signing via server or gas-less flows for new users.
- Full orderbook DEX integration and atomic multi-hop swaps for robust arbitrage settlement.
- Indexer & event stream (Soroban indexer) to provide realtime confirmations and analytics.
- Audit and formal verification for Soroban contracts.

## 12) Challenges / Learnings

- Soroban is a new environment — bridging WASM contract design patterns to financial primitives required careful type mapping and simulation-first design.
- UX for on-chain signing: making simulations visible before asking users to sign reduces failed transactions and improves trust.
- Atomic settlement across multiple DEXs is non-trivial; design requires escrow or composite contract invocations.

## 13) Team / Credits

- Project lead: [Prajwal Bhosale] — product, integration, frontend (GitHub: @yourhandle)
- Smart contracts: [Shruti Bhosale] — Rust / Soroban (GitHub: @contributor)
- Backend & agents: [Sakshi Choudhari ] — Node.js / Python (GitHub: @contributor2)

Acknowledgments
- Stellar Development Foundation — for Soroban tooling and SDKs
- Freighter team — wallet integration patterns
