// Minimal stub of the useStellarDapp hook and TokenBalance type so the frontend compiles
// Replace with the real implementation when available.
import { useCallback, useState, useEffect } from 'react';
// We will dynamically import the Stellar SDK at runtime inside swapTokens so builds
// don't fail in environments where the package isn't installed yet. For submission
// we use the Fetch API instead of axios to avoid a hard dependency here.

export interface TokenBalance {
  symbol: string;
  balance: number;
  decimals: number;
}

// Public Token type for UI selection components
export interface Token {
  symbol: string;
  name: string;
  decimals: number;
}

// Known tokens used by the demo swap UI. Replace or extend with real token metadata.
export const KNOWN_TOKENS: Token[] = [
  { symbol: 'XLM', name: 'Stellar Lumens', decimals: 7 },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'TST', name: 'Test Token', decimals: 6 },
];

// Futurenet / Soroban endpoints and passphrase. Update if your network uses different endpoints.
export const FUTURENET_RPC_URL = process.env.NEXT_PUBLIC_FUTURENET_RPC_URL || 'https://rpc-futurenet.stellar.org';
export const FUTURENET_HORIZON_URL = process.env.NEXT_PUBLIC_FUTURENET_HORIZON_URL || 'https://horizon-futurenet.stellar.org';
export const FUTURENET_PASSPHRASE = process.env.NEXT_PUBLIC_FUTURENET_PASSPHRASE || 'Test SDF Network ; September 2015';

export function useStellarDapp() {
  const [tokenBalances] = useState<TokenBalance[]>([]);
  const [isBalancesLoading] = useState(false);
  const [isConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isFreighterAvailable, setIsFreighterAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);

  const fetchBalances = useCallback(() => {
    // noop stub
    return;
  }, []);

  // Detect Freighter existence only on client side (avoid referencing `window` during SSR)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsFreighterAvailable(typeof (window as any).freighter !== 'undefined');
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      // Try to get publicKey from Freighter (guard window for SSR safety)
      // Note: Freighter uses freighterApi (not freighter)
      const freighterApi = typeof window !== 'undefined' ? (window as any).freighterApi : undefined;
      if (freighterApi && typeof freighterApi.getPublicKey === 'function') {
        const pk = await freighterApi.getPublicKey();
        setPublicKey(pk);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setPublicKey(null);
  }, []);

  /**
   * swapTokens
   * Builds a simple Stellar transaction (mocking the Soroban invoke) and asks Freighter to sign it.
   * NOTE: This implementation uses a ManageData op as a placeholder for an actual Soroban invocation.
   */
  const swapTokens = useCallback(
    async (tokenIn: Token, tokenOut: Token, amountIn: string) => {
      setError(null);
      setTransactionStatus(null);
      if (!publicKey) {
        setError('Wallet not connected');
        return;
      }

      setLoading(true);
      try {
        // Dynamically import Stellar SDK so builds don't fail if it's not installed yet.
  // @ts-ignore - dynamic import: allow runtime resolution; ensure package is installed in your app.
  // Note: the published npm package is `stellar-sdk` (no @ scope)
  const stellarSdk = await import('stellar-sdk').catch(() => null);
        if (!stellarSdk) throw new Error('Missing dependency: @stellar/stellar-sdk. Please install it in the frontend project.');

        const { Server, TransactionBuilder, Operation, Memo } = stellarSdk as any;

        const server = new Server(FUTURENET_HORIZON_URL);

        // Load account
        const account = await server.loadAccount(publicKey);

        // Build a placeholder transaction - in a real implementation this would be an invokeHostFunction
        const tx = new TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: FUTURENET_PASSPHRASE,
          memo: Memo.text('Swap via demo'),
        })
          .addOperation(
            Operation.manageData({
              name: 'swap_demo',
              value: `${tokenIn.symbol}->${tokenOut.symbol}:${amountIn}`,
            })
          )
          .setTimeout(30)
          .build();

        const txXDR = tx.toXDR();

        // Sign via Freighter
        const freighterApi = typeof window !== 'undefined' ? (window as any).freighterApi : undefined;
        if (!freighterApi || typeof freighterApi.signTransaction !== 'function') {
          throw new Error('Freighter not available for signing');
        }

        const signed = await freighterApi.signTransaction(txXDR, { 
          networkPassphrase: FUTURENET_PASSPHRASE,
          network: 'FUTURENET'
        });

        // Freighter returns the signed XDR directly as a string
        const signedXDR = signed;
        if (!signedXDR) throw new Error('Failed to obtain signed transaction XDR from Freighter');

        // Submit to Horizon using fetch (no axios required)
        const payload = `tx=${encodeURIComponent(signedXDR)}`;
        const submitRes = await fetch(`${FUTURENET_HORIZON_URL}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: payload,
        });
        const resJson = await submitRes.json();

        setTransactionStatus('success:' + (resJson?.hash || 'submitted'));
        return resJson;
      } catch (err: any) {
        setError(err?.message || String(err));
        setTransactionStatus('failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [publicKey]
  );

  return {
    tokenBalances,
    isBalancesLoading,
    isConnected,
    fetchBalances,
    publicKey,
    isFreighterAvailable,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    swapTokens,
    transactionStatus,
  } as const;
}
