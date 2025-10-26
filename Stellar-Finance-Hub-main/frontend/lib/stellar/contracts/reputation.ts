import { Contract, TransactionBuilder, Address, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';
import { getServer, NETWORK_PASSPHRASE } from '../config';
import { getAddress, signTransaction } from '@stellar/freighter-api';

export interface ReputationData {
  score: number;
  total_interactions: number;
  last_updated: number;
}

export class ReputationContract {
  private contractId: string;
  
  constructor(contractId: string) {
    this.contractId = contractId;
  }

  async getReputation(account: string): Promise<number> {
    try {
      // If no contract ID, return default
      if (!this.contractId || this.contractId === 'mock-reputation-contract') {
        console.log('No contract deployed, using default reputation');
        return 500;
      }
      
      const server = getServer();
      const contract = new Contract(this.contractId);
      
      // Build transaction for simulation
      const sourceAccount = await server.getAccount(account);
      const tx = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            'get_reputation',
            new Address(account).toScVal()
          )
        )
        .setTimeout(30)
        .build();

      const result = await server.simulateTransaction(tx);
      
      if (result.results && result.results.length > 0) {
        return scValToNative(result.results[0].retval);
      }
      
      return 500; // Default score
    } catch (error) {
      console.error('Error getting reputation:', error);
      return 500;
    }
  }

  async updateReputation(account: string, delta: number): Promise<string> {
    const server = getServer();
    const contract = new Contract(this.contractId);
    
    const sourceAccount = await server.getAccount(account);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'update_reputation',
          new Address(account).toScVal(),
          nativeToScVal(delta, { type: 'i32' })
        )
      )
      .setTimeout(30)
      .build();

    const prepared = await server.prepareTransaction(tx);
    const xdr = prepared.toXDR();
    
    // Sign with Freighter
    const signedXdr = await signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE
    });

    const signedTx = TransactionBuilder.fromXDR(signedXdr.signedTxXdr, NETWORK_PASSPHRASE);
    const result = await server.sendTransaction(signedTx);
    
    return result.hash;
  }

  async getReputationData(account: string): Promise<ReputationData> {
    try {
      const server = getServer();
      const contract = new Contract(this.contractId);
      
      const sourceAccount = await server.getAccount(account);
      const tx = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            'get_reputation_data',
            new Address(account).toScVal()
          )
        )
        .setTimeout(30)
        .build();

      const result = await server.simulateTransaction(tx);
      
      if (result.results && result.results.length > 0) {
        const data = scValToNative(result.results[0].retval);
        return {
          score: data.score || 500,
          total_interactions: data.total_interactions || 0,
          last_updated: data.last_updated || 0
        };
      }
      
      return {
        score: 500,
        total_interactions: 0,
        last_updated: 0
      };
    } catch (error) {
      console.error('Error getting reputation data:', error);
      return {
        score: 500,
        total_interactions: 0,
        last_updated: 0
      };
    }
  }

  async increment(account: string, amount: number): Promise<string> {
    return this.updateReputation(account, amount);
  }

  async decrement(account: string, amount: number): Promise<string> {
    return this.updateReputation(account, -amount);
  }

  async meetsThreshold(account: string, threshold: number): Promise<boolean> {
    const score = await this.getReputation(account);
    return score >= threshold;
  }
}
