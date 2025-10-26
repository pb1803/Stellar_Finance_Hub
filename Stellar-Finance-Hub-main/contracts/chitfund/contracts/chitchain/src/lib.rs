#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ChitFund {
    pub fund_id: u64,
    pub pot_balance: i128,
    pub members: Vec<Address>,
    pub cycle_length: u32,  // in days
    pub contribution: i128,
    pub status: u32,  // 0=pending, 1=active, 2=completed
    pub creator: Address,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Member {
    pub address: Address,
    pub contributed: i128,
    pub has_received: bool,
    pub joined_at: u64,
}

#[contract]
pub struct ChitChain;

#[contractimpl]
impl ChitChain {
    /// Create a new chit fund
    pub fn create_fund(
        env: Env,
        creator: Address,
        contribution: i128,
        cycle_length: u32,
        max_members: u32,
    ) -> u64 {
        creator.require_auth();

        let fund_id = env.ledger().sequence() as u64;
        
        let mut members = Vec::new(&env);
        members.push_back(creator.clone());

        let fund = ChitFund {
            fund_id,
            pot_balance: 0,
            members: members.clone(),
            cycle_length,
            contribution,
            status: 0, // pending
            creator: creator.clone(),
            created_at: env.ledger().timestamp(),
        };

        let member = Member {
            address: creator.clone(),
            contributed: 0,
            has_received: false,
            joined_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&("fund", fund_id), &fund);
        env.storage().persistent().set(&("member", fund_id, creator.clone()), &member);

        fund_id
    }

    /// Join an existing chit fund
    pub fn join_fund(env: Env, fund_id: u64, member: Address) {
        member.require_auth();

        let mut fund = Self::get_fund(env.clone(), fund_id);
        
        // Check if fund is still accepting members
        if fund.status != 0 {
            panic!("Fund is not accepting new members");
        }

        // Add member
        fund.members.push_back(member.clone());
        
        let new_member = Member {
            address: member.clone(),
            contributed: 0,
            has_received: false,
            joined_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&("fund", fund_id), &fund);
        env.storage().persistent().set(&("member", fund_id, member), &new_member);
    }

    /// Contribute to chit fund
    pub fn contribute(env: Env, fund_id: u64, contributor: Address, amount: i128) {
        contributor.require_auth();

        let mut fund = Self::get_fund(env.clone(), fund_id);
        
        // Update pot balance
        fund.pot_balance += amount;

        // Update member contribution
        let member_key = ("member", fund_id, contributor.clone());
        let mut member: Member = env.storage()
            .persistent()
            .get(&member_key)
            .expect("Member not found");
        
        member.contributed += amount;

        env.storage().persistent().set(&("fund", fund_id), &fund);
        env.storage().persistent().set(&member_key, &member);
    }

    /// Distribute pot to a member
    pub fn distribute(env: Env, fund_id: u64, recipient: Address) {
        let mut fund = Self::get_fund(env.clone(), fund_id);
        
        // Only creator can distribute
        fund.creator.require_auth();

        let member_key = ("member", fund_id, recipient.clone());
        let mut member: Member = env.storage()
            .persistent()
            .get(&member_key)
            .expect("Member not found");

        if member.has_received {
            panic!("Member has already received payout");
        }

        // Mark as received
        member.has_received = true;
        
        // Reset pot balance
        fund.pot_balance = 0;

        env.storage().persistent().set(&("fund", fund_id), &fund);
        env.storage().persistent().set(&member_key, &member);
    }

    /// Get fund details
    pub fn get_fund(env: Env, fund_id: u64) -> ChitFund {
        env.storage()
            .persistent()
            .get(&("fund", fund_id))
            .expect("Fund not found")
    }

    /// Get member details
    pub fn get_member(env: Env, fund_id: u64, member: Address) -> Member {
        env.storage()
            .persistent()
            .get(&("member", fund_id, member))
            .expect("Member not found")
    }

    /// Start the fund (change status to active)
    pub fn start_fund(env: Env, fund_id: u64) {
        let mut fund = Self::get_fund(env.clone(), fund_id);
        fund.creator.require_auth();
        
        fund.status = 1; // active
        env.storage().persistent().set(&("fund", fund_id), &fund);
    }

    /// Complete the fund
    pub fn complete_fund(env: Env, fund_id: u64) {
        let mut fund = Self::get_fund(env.clone(), fund_id);
        fund.creator.require_auth();
        
        fund.status = 2; // completed
        env.storage().persistent().set(&("fund", fund_id), &fund);
    }
}

#[cfg(test)]
mod test;
