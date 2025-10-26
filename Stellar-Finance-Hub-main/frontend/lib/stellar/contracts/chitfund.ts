import { Contract, TransactionBuilder, Address, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';
import { getServer, NETWORK_PASSPHRASE } from '../config';
import { signTransaction } from '@stellar/freighter-api';

export interface ChitFund {
  fund_id: number;
  pot_balance: bigint;
  members: string[];
  cycle_length: number;
  contribution: bigint;
  status: number;
  creator: string;
  created_at: number;
}

export interface Member {
  address: string;
  contributed: bigint;
  has_received: boolean;
  joined_at: number;
}

export class ChitFundContract {
  private contractId: string;
  
  constructor(contractId: string) {
    this.contractId = contractId;
  }

  async createFund(
    creator: string,
    contribution: bigint,
    cycleLength: number,
    maxMembers: number
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
          'create_fund',
          new Address(creator).toScVal(),
          nativeToScVal(contribution, { type: 'i128' }),
          nativeToScVal(cycleLength, { type: 'u32' }),
          nativeToScVal(maxMembers, { type: 'u32' })
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

  async joinFund(fundId: number, member: string): Promise<string> {
    const server = getServer();
    const contract = new Contract(this.contractId);
    
    const sourceAccount = await server.getAccount(member);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '1000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'join_fund',
          nativeToScVal(fundId, { type: 'u64' }),
          new Address(member).toScVal()
        )
      )
      .setTimeout(30)
      .build();

    const prepared = await server.prepareTransaction(tx);
    const xdr = prepared.toXDR();
    
    const signedXdr = await signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE
    });

    const signedTx = TransactionBuilder.fromXDR(signedXdr.signedTxXdr, NETWORK_PASSPHRASE);
    const result = await server.sendTransaction(signedTx);
    
    return result.hash;
  }

  async contribute(fundId: number, contributor: string, amount: bigint): Promise<string> {
    const server = getServer();
    const contract = new Contract(this.contractId);
    
    const sourceAccount = await server.getAccount(contributor);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '1000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'contribute',
          nativeToScVal(fundId, { type: 'u64' }),
          new Address(contributor).toScVal(),
          nativeToScVal(amount, { type: 'i128' })
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

  async getFund(fundId: number): Promise<ChitFund | null> {
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
            'get_fund',
            nativeToScVal(fundId, { type: 'u64' })
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
      console.error('Error getting fund:', error);
      return null;
    }
  }

  async getMember(fundId: number, member: string): Promise<Member | null> {
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
            'get_member',
            nativeToScVal(fundId, { type: 'u64' }),
            new Address(member).toScVal()
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
      console.error('Error getting member:', error);
      return null;
    }
  }
}
