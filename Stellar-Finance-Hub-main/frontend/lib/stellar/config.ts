// Stellar configuration for Frontend
import { Networks } from '@stellar/stellar-sdk';

export const NETWORK = 'TESTNET';
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';

// Contract IDs (update after deployment)
export const CONTRACTS = {
  REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT || 'mock-reputation-contract',
  CHITFUND: process.env.NEXT_PUBLIC_CHITFUND_CONTRACT || 'mock-chitfund-contract',
  PREDICTION: process.env.NEXT_PUBLIC_PREDICTION_CONTRACT || 'mock-prediction-contract',
};

// Mock RPC Server for development (replace with real when contracts deployed)
export function getServer(): any {
  return {
    getAccount: async (address: string) => ({ address }),
    simulateTransaction: async () => ({ results: [] }),
    prepareTransaction: async (tx: any) => tx,
    sendTransaction: async () => ({ hash: 'mock-tx-hash' })
  };
}
