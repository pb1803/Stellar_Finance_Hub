import { Contract, TransactionBuilder, Address, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';
import { getServer, NETWORK_PASSPHRASE } from '../config';
import { signTransaction } from '@stellar/freighter-api';

export interface Market {
  market_id: number;
  question: number;
  creator: string;
  total_yes: bigint;
  total_no: bigint;
  resolved: boolean;
  outcome: boolean;
  end_time: number;
  created_at: number;
}

export interface Stake {
  staker: string;
  amount: bigint;
  position: boolean;
  claimed: boolean;
}

export class PredictionMarketContract {
  private contractId: string;
  
  constructor(contractId: string) {
    this.contractId = contractId;
  }

  async createMarket(
    creator: string,
    question: number,
    endTime: number
  ): Promise<string> {
    const server = getServer();
    const contract = new Contract(this.contractId);
    
    const sourceAccount = await server.getAccount(creator);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '1000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'create_market',
          new Address(creator).toScVal(),
          nativeToScVal(question, { type: 'u32' }),
          nativeToScVal(endTime, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();

    const prepared = await server.prepareTransaction(tx);
    const xdr = prepared.toXDR();
    
    const signedXdr = await signTransaction(xdr, {
      network: 'TESTNET',
      networkPassphrase: NETWORK_PASSPHRASE
    });

    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const result = await server.sendTransaction(signedTx);
    
    return result.hash;
  }

  async stake(
    marketId: number,
    staker: string,
    amount: bigint,
    position: boolean
  ): Promise<string> {
    const server = getServer();
    const contract = new Contract(this.contractId);
    
    const sourceAccount = await server.getAccount(staker);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '1000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'stake',
          nativeToScVal(marketId, { type: 'u64' }),
          new Address(staker).toScVal(),
          nativeToScVal(amount, { type: 'i128' }),
          nativeToScVal(position, { type: 'bool' })
        )
      )
      .setTimeout(30)
      .build();

    const prepared = await server.prepareTransaction(tx);
    const xdr = prepared.toXDR();
    
    const signedXdr = await signTransaction(xdr, {
      network: 'TESTNET',
      networkPassphrase: NETWORK_PASSPHRASE
    });

    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const result = await server.sendTransaction(signedTx);
    
    return result.hash;
  }

  async resolve(marketId: number, creator: string, outcome: boolean): Promise<string> {
    const server = getServer();
    const contract = new Contract(this.contractId);
    
    const sourceAccount = await server.getAccount(creator);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '1000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'resolve',
          nativeToScVal(marketId, { type: 'u64' }),
          nativeToScVal(outcome, { type: 'bool' })
        )
      )
      .setTimeout(30)
      .build();

    const prepared = await server.prepareTransaction(tx);
    const xdr = prepared.toXDR();
    
    const signedXdr = await signTransaction(xdr, {
      network: 'TESTNET',
      networkPassphrase: NETWORK_PASSPHRASE
    });

    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const result = await server.sendTransaction(signedTx);
    
    return result.hash;
  }

  async claim(marketId: number, staker: string): Promise<string> {
    const server = getServer();
    const contract = new Contract(this.contractId);
    
    const sourceAccount = await server.getAccount(staker);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '1000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'claim',
          nativeToScVal(marketId, { type: 'u64' }),
          new Address(staker).toScVal()
        )
      )
      .setTimeout(30)
      .build();

    const prepared = await server.prepareTransaction(tx);
    const xdr = prepared.toXDR();
    
    const signedXdr = await signTransaction(xdr, {
      network: 'TESTNET',
      networkPassphrase: NETWORK_PASSPHRASE
    });

    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const result = await server.sendTransaction(signedTx);
    
    return result.hash;
  }

  async getMarket(marketId: number): Promise<Market | null> {
    try {
      const server = getServer();
      const contract = new Contract(this.contractId);
      
      const dummyAccount = await server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
      const tx = new TransactionBuilder(dummyAccount, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            'get_market',
            nativeToScVal(marketId, { type: 'u64' })
          )
        )
        .setTimeout(30)
        .build();

      const result = await server.simulateTransaction(tx);
      
      if (result.results && result.results.length > 0) {
        return scValToNative(result.results[0].retval);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting market:', error);
      return null;
    }
  }

  async getOdds(marketId: number): Promise<number> {
    try {
      const server = getServer();
      const contract = new Contract(this.contractId);
      
      const dummyAccount = await server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
      const tx = new TransactionBuilder(dummyAccount, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            'get_odds',
            nativeToScVal(marketId, { type: 'u64' })
          )
        )
        .setTimeout(30)
        .build();

      const result = await server.simulateTransaction(tx);
      
      if (result.results && result.results.length > 0) {
        return scValToNative(result.results[0].retval);
      }
      
      return 5000; // 50%
    } catch (error) {
      console.error('Error getting odds:', error);
      return 5000;
    }
  }
}
