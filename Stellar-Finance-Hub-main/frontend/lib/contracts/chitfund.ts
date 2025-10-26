import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG, NETWORK_PASSPHRASES, CONTRACTS } from '@/config/contracts';

export class ChitFundClient {
  private contract: StellarSdk.Contract;
  private server: StellarSdk.SorobanRpc.Server;

  constructor() {
    this.contract = new StellarSdk.Contract(CONTRACTS.CHITFUND);
    this.server = new StellarSdk.SorobanRpc.Server(STELLAR_CONFIG.RPC_URL);
  }

  async createFund(
    creator: string,
    contribution: bigint,
    cycleLength: number,
    maxMembers: number,
    signTransaction: (xdr: string) => Promise<string>
  ): Promise<string | null> {
    try {
      const accountObj = await this.server.getAccount(creator);
      
      const tx = new StellarSdk.TransactionBuilder(accountObj, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASES[STELLAR_CONFIG.NETWORK],
      })
        .addOperation(
          this.contract.call(
            'create_fund',
            StellarSdk.Address.fromString(creator).toScVal(),
            StellarSdk.nativeToScVal(contribution, { type: 'i128' }),
            StellarSdk.nativeToScVal(cycleLength, { type: 'u32' }),
            StellarSdk.nativeToScVal(maxMembers, { type: 'u32' })
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
      console.error('Error creating fund:', error);
      return null;
    }
  }

  async joinFund(
    fundId: bigint,
    member: string,
    signTransaction: (xdr: string) => Promise<string>
  ): Promise<boolean> {
    try {
      const accountObj = await this.server.getAccount(member);
      
      const tx = new StellarSdk.TransactionBuilder(accountObj, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASES[STELLAR_CONFIG.NETWORK],
      })
        .addOperation(
          this.contract.call(
            'join_fund',
            StellarSdk.nativeToScVal(fundId, { type: 'u64' }),
            StellarSdk.Address.fromString(member).toScVal()
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
      console.error('Error joining fund:', error);
      return false;
    }
  }

  async contribute(
    fundId: bigint,
    contributor: string,
    amount: bigint,
    signTransaction: (xdr: string) => Promise<string>
  ): Promise<boolean> {
    try {
      const accountObj = await this.server.getAccount(contributor);
      
      const tx = new StellarSdk.TransactionBuilder(accountObj, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASES[STELLAR_CONFIG.NETWORK],
      })
        .addOperation(
          this.contract.call(
            'contribute',
            StellarSdk.nativeToScVal(fundId, { type: 'u64' }),
            StellarSdk.Address.fromString(contributor).toScVal(),
            StellarSdk.nativeToScVal(amount, { type: 'i128' })
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
      console.error('Error contributing:', error);
      return false;
    }
  }

  async getFund(fundId: bigint) {
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
            'get_fund',
            StellarSdk.nativeToScVal(fundId, { type: 'u64' })
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
      console.error('Error getting fund:', error);
      return null;
    }
  }
}
