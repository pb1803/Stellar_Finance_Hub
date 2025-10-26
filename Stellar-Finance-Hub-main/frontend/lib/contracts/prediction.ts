import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG, NETWORK_PASSPHRASES, CONTRACTS } from '@/config/contracts';

export class PredictionMarketClient {
  private contract: StellarSdk.Contract;
  private server: StellarSdk.SorobanRpc.Server;

  constructor() {
    this.contract = new StellarSdk.Contract(CONTRACTS.PREDICTION);
    this.server = new StellarSdk.SorobanRpc.Server(STELLAR_CONFIG.RPC_URL);
  }

  async createMarket(
    creator: string,
    question: string,
    endTime: bigint,
    signTransaction: (xdr: string) => Promise<string>
  ): Promise<string | null> {
    try {
      const accountObj = await this.server.getAccount(creator);
      const questionHash = StellarSdk.hash(Buffer.from(question)).readUInt32BE(0);
      
      const tx = new StellarSdk.TransactionBuilder(accountObj, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASES[STELLAR_CONFIG.NETWORK],
      })
        .addOperation(
          this.contract.call(
            'create_market',
            StellarSdk.Address.fromString(creator).toScVal(),
            StellarSdk.nativeToScVal(questionHash, { type: 'u32' }),
            StellarSdk.nativeToScVal(endTime, { type: 'u64' })
          )
        )
        .setTimeout(30)
        .build();

      const prepared = await this.server.prepareTransaction(tx);
      const signedXDR = await signTransaction(prepared.toXDR());
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXDR,
        NETWORK_PASSPHRASES[STELLAR_CONFIG.NETWORK]
      );

      const result = await this.server.sendTransaction(signedTx as StellarSdk.Transaction);
      
      if (result.status === 'PENDING' || result.status === 'SUCCESS') {
        return result.hash;
      }
      return null;
    } catch (error) {
      console.error('Error creating market:', error);
      return null;
    }
  }

  async stake(
    marketId: bigint,
    staker: string,
    amount: bigint,
    position: boolean,
    signTransaction: (xdr: string) => Promise<string>
  ): Promise<boolean> {
    try {
      const accountObj = await this.server.getAccount(staker);
      
      const tx = new StellarSdk.TransactionBuilder(accountObj, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASES[STELLAR_CONFIG.NETWORK],
      })
        .addOperation(
          this.contract.call(
            'stake',
            StellarSdk.nativeToScVal(marketId, { type: 'u64' }),
            StellarSdk.Address.fromString(staker).toScVal(),
            StellarSdk.nativeToScVal(amount, { type: 'i128' }),
            StellarSdk.nativeToScVal(position, { type: 'bool' })
          )
        )
        .setTimeout(30)
        .build();

      const prepared = await this.server.prepareTransaction(tx);
      const signedXDR = await signTransaction(prepared.toXDR());
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXDR,
        NETWORK_PASSPHRASES[STELLAR_CONFIG.NETWORK]
      );

      const result = await this.server.sendTransaction(signedTx as StellarSdk.Transaction);
      return result.status === 'PENDING' || result.status === 'SUCCESS';
    } catch (error) {
      console.error('Error staking:', error);
      return false;
    }
  }

  async getMarket(marketId: bigint) {
    try {
      const dummyAccount = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
      const tx = new StellarSdk.TransactionBuilder(
        new StellarSdk.Account(dummyAccount, '0'),
        {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASES[STELLAR_CONFIG.NETWORK],
        }
      )
        .addOperation(
          this.contract.call(
            'get_market',
            StellarSdk.nativeToScVal(marketId, { type: 'u64' })
          )
        )
        .setTimeout(30)
        .build();

      const result = await this.server.simulateTransaction(tx);
      
      if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(result)) {
        return StellarSdk.scValToNative(result.result!.retval);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting market:', error);
      return null;
    }
  }

  async getOdds(marketId: bigint): Promise<number> {
    try {
      const dummyAccount = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
      const tx = new StellarSdk.TransactionBuilder(
        new StellarSdk.Account(dummyAccount, '0'),
        {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASES[STELLAR_CONFIG.NETWORK],
        }
      )
        .addOperation(
          this.contract.call(
            'get_odds',
            StellarSdk.nativeToScVal(marketId, { type: 'u64' })
          )
        )
        .setTimeout(30)
        .build();

      const result = await this.server.simulateTransaction(tx);
      
      if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(result)) {
        const odds = StellarSdk.scValToNative(result.result!.retval);
        return odds / 100; // Convert from percentage * 100 to percentage
      }
      
      return 50; // Default 50%
    } catch (error) {
      console.error('Error getting odds:', error);
      return 50;
    }
  }
}
