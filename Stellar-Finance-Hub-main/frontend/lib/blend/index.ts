/**
 * Blend Protocol Integration
 * Provides yield farming and lending/borrowing functionality
 * https://blend.capital
 */

import { Contract, Soroban, xdr } from '@stellar/stellar-sdk';
import { NETWORK_CONFIG } from '@/config/contracts';

// Blend Protocol Contract Addresses (Testnet)
export const BLEND_CONTRACTS = {
  POOL: process.env.NEXT_PUBLIC_BLEND_POOL_CONTRACT || 'CBGTG6GXMMED7FNP2GQKLRBATNBNNG7VKEEWVXQOVNE4YF5PGW5S4BDJ',
  USDC: process.env.NEXT_PUBLIC_BLEND_USDC_CONTRACT || 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75',
  XLM: process.env.NEXT_PUBLIC_BLEND_XLM_CONTRACT || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
};

const server = new Soroban.Server(NETWORK_CONFIG.sorobanRpcUrl);

/**
 * Blend Pool Client for yield farming
 */
export class BlendPoolClient {
  private contract: Contract;

  constructor() {
    this.contract = new Contract(BLEND_CONTRACTS.POOL);
  }

  /**
   * Build transaction to supply assets to Blend pool
   */
  buildSupply(user: string, asset: string, amount: bigint) {
    const params = [
      this.addressToScVal(user),
      this.addressToScVal(asset),
      xdr.ScVal.scvI128(this.bigintToI128(amount)),
    ];

    return this.contract.call('supply', ...params);
  }

  /**
   * Build transaction to borrow from Blend pool
   */
  buildBorrow(user: string, asset: string, amount: bigint) {
    const params = [
      this.addressToScVal(user),
      this.addressToScVal(asset),
      xdr.ScVal.scvI128(this.bigintToI128(amount)),
    ];

    return this.contract.call('borrow', ...params);
  }

  /**
   * Build transaction to repay borrowed assets
   */
  buildRepay(user: string, asset: string, amount: bigint) {
    const params = [
      this.addressToScVal(user),
      this.addressToScVal(asset),
      xdr.ScVal.scvI128(this.bigintToI128(amount)),
    ];

    return this.contract.call('repay', ...params);
  }

  /**
   * Build transaction to withdraw supplied assets
   */
  buildWithdraw(user: string, asset: string, amount: bigint) {
    const params = [
      this.addressToScVal(user),
      this.addressToScVal(asset),
      xdr.ScVal.scvI128(this.bigintToI128(amount)),
    ];

    return this.contract.call('withdraw', ...params);
  }

  /**
   * Get current supply APY for an asset
   */
  async getSupplyAPY(asset: string): Promise<number> {
    try {
      // This would call the Blend contract's getSupplyAPY method
      // For demo, return mock data
      const mockAPYs: Record<string, number> = {
        [BLEND_CONTRACTS.USDC]: 8.5,
        [BLEND_CONTRACTS.XLM]: 5.2,
      };
      return mockAPYs[asset] || 3.0;
    } catch (error) {
      console.error('Error getting supply APY:', error);
      return 0;
    }
  }

  /**
   * Get current borrow APY for an asset
   */
  async getBorrowAPY(asset: string): Promise<number> {
    try {
      const mockAPYs: Record<string, number> = {
        [BLEND_CONTRACTS.USDC]: 12.3,
        [BLEND_CONTRACTS.XLM]: 9.8,
      };
      return mockAPYs[asset] || 5.0;
    } catch (error) {
      console.error('Error getting borrow APY:', error);
      return 0;
    }
  }

  /**
   * Get user's position in Blend
   */
  async getUserPosition(user: string): Promise<{
    supplied: { asset: string; amount: bigint; apy: number }[];
    borrowed: { asset: string; amount: bigint; apy: number }[];
    healthFactor: number;
  }> {
    try {
      // This would query the user's position from the contract
      // For demo, return mock data
      return {
        supplied: [
          { asset: 'USDC', amount: 10000n * 1000000n, apy: 8.5 },
        ],
        borrowed: [
          { asset: 'XLM', amount: 5000n * 10000000n, apy: 9.8 },
        ],
        healthFactor: 1.5, // >1 is healthy
      };
    } catch (error) {
      console.error('Error getting user position:', error);
      return {
        supplied: [],
        borrowed: [],
        healthFactor: 0,
      };
    }
  }

  // Helper methods
  private addressToScVal(address: string): xdr.ScVal {
    return xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(
      xdr.PublicKey.publicKeyTypeEd25519(Buffer.from(address, 'base64'))
    ));
  }

  private bigintToI128(value: bigint): xdr.Int128Parts {
    const MASK_64 = (1n << 64n) - 1n;
    return new xdr.Int128Parts({
      hi: xdr.Int64.fromString((value >> 64n).toString()),
      lo: xdr.Uint64.fromString((value & MASK_64).toString()),
    });
  }
}

/**
 * Helper to calculate optimal yield strategy
 */
export function calculateYieldStrategy(
  supplied: { asset: string; amount: bigint; apy: number }[],
  borrowed: { asset: string; amount: bigint; apy: number }[]
): {
  netAPY: number;
  suggestion: string;
} {
  const totalSuppliedValue = supplied.reduce((sum, s) => sum + Number(s.amount) * s.apy, 0);
  const totalBorrowedValue = borrowed.reduce((sum, b) => sum + Number(b.amount) * b.apy, 0);
  
  const netAPY = (totalSuppliedValue - totalBorrowedValue) / 
    (supplied.reduce((sum, s) => sum + Number(s.amount), 0) || 1);

  let suggestion = 'Your yield strategy looks good!';
  
  if (netAPY < 5) {
    suggestion = 'Consider supplying more high-APY assets to increase yields';
  } else if (netAPY > 15) {
    suggestion = 'Great yield! Consider diversifying to manage risk';
  }

  return { netAPY, suggestion };
}
