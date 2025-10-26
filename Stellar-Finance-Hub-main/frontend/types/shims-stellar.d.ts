declare module '@stellar/stellar-sdk';
declare module 'axios';
declare module '@stellar/freighter-api';

// Generic window.freighter and window.freighterApi typing to avoid TS errors
// Freighter now uses freighterApi (updated API)
interface FreighterAPI {
  isConnected: () => Promise<boolean>;
  getPublicKey: () => Promise<string>;
  signTransaction: (xdr: string, opts?: { network?: string; networkPassphrase?: string }) => Promise<string>;
  getNetwork: () => Promise<string>;
}

interface Window {
  // New API (current)
  freighterApi?: FreighterAPI;
  // Old API (deprecated, for backward compatibility)
  freighter?: {
    getPublicKey?: () => Promise<string>;
    signTransaction?: (opts: { transactionXDR: string; networkPassphrase: string }) => Promise<any>;
  };
}

export {};
