import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG, NETWORK_PASSPHRASES, CONTRACTS } from '@/config/contracts';

export class ReputationClient {
  private contract: StellarSdk.Contract;
  private server: StellarSdk.SorobanRpc.Server;

  constructor() {
    this.contract = new StellarSdk.Contract(CONTRACTS.REPUTATION);
    this.server = new StellarSdk.SorobanRpc.Server(STELLAR_CONFIG.RPC_URL);
  }

  async getReputation(account: string): Promise<number> {
    try {
      const tx = new StellarSdk.TransactionBuilder(
        new StellarSdk.Account(account, '0'),
        {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASES[STELLAR_CONFIG.NETWORK],
        }
      )
        .addOperation(
          this.contract.call(
            'get_reputation',
            StellarSdk.Address.fromString(account).toScVal()
          )
        )
        .setTimeout(30)
        .build();

      const result = await this.server.simulateTransaction(tx);
      
      if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(result)) {
        return StellarSdk.scValToNative(result.result!.retval);
      }
      
      return 500; // Default score
    } catch (error) {
      console.error('Error getting reputation:', error);
      return 500;
    }
  }

  async updateReputation(
    account: string,
    delta: number,
    signTransaction: (xdr: string) => Promise<string>
  ): Promise<boolean> {
    try {
      const accountObj = await this.server.getAccount(account);
      
      const tx = new StellarSdk.TransactionBuilder(accountObj, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASES[STELLAR_CONFIG.NETWORK],
      })
        .addOperation(
          this.contract.call(
            'update_reputation',
            StellarSdk.Address.fromString(account).toScVal(),
            StellarSdk.nativeToScVal(delta, { type: 'i32' })
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
      console.error('Error updating reputation:', error);
      return false;
    }
  }

  async getReputationData(account: string) {
    try {
      const tx = new StellarSdk.TransactionBuilder(
        new StellarSdk.Account(account, '0'),
        {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASES[STELLAR_CONFIG.NETWORK],
        }
      )
        .addOperation(
          this.contract.call(
            'get_reputation_data',
            StellarSdk.Address.fromString(account).toScVal()
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
      console.error('Error getting reputation data:', error);
      return null;
    }
  }
}
