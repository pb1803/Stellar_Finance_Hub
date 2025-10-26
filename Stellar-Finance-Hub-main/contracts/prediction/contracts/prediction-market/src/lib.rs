#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Market {
    pub market_id: u64,
    pub question: u32, // Symbol hash for question
    pub creator: Address,
    pub total_yes: i128,
    pub total_no: i128,
    pub resolved: bool,
    pub outcome: bool, // true=yes, false=no
    pub end_time: u64,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Stake {
    pub staker: Address,
    pub amount: i128,
    pub position: bool, // true=yes, false=no
    pub claimed: bool,
}

#[contract]
pub struct PredictionMarket;

#[contractimpl]
impl PredictionMarket {
    /// Create a new prediction market
    pub fn create_market(
        env: Env,
        creator: Address,
        question: u32,
        end_time: u64,
    ) -> u64 {
        creator.require_auth();

        let market_id = env.ledger().sequence() as u64;
        
        let market = Market {
            market_id,
            question,
            creator: creator.clone(),
            total_yes: 0,
            total_no: 0,
            resolved: false,
            outcome: false,
            end_time,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&("market", market_id), &market);
        
        market_id
    }

    /// Stake on a prediction (true=yes, false=no)
    pub fn stake(
        env: Env,
        market_id: u64,
        staker: Address,
        amount: i128,
        position: bool,
    ) {
        staker.require_auth();

        let mut market = Self::get_market(env.clone(), market_id);
        
        // Check market not resolved and not ended
        if market.resolved {
            panic!("Market already resolved");
        }
        
        if env.ledger().timestamp() > market.end_time {
            panic!("Market ended");
        }

        // Update totals
        if position {
            market.total_yes += amount;
        } else {
            market.total_no += amount;
        }

        // Create stake record
        let stake = Stake {
            staker: staker.clone(),
            amount,
            position,
            claimed: false,
        };

        let stake_key = ("stake", market_id, staker.clone());
        env.storage().persistent().set(&("market", market_id), &market);
        env.storage().persistent().set(&stake_key, &stake);
    }

    /// Resolve the market (only creator)
    pub fn resolve(
        env: Env,
        market_id: u64,
        outcome: bool,
    ) {
        let mut market = Self::get_market(env.clone(), market_id);
        market.creator.require_auth();

        if market.resolved {
            panic!("Market already resolved");
        }

        market.resolved = true;
        market.outcome = outcome;

        env.storage().persistent().set(&("market", market_id), &market);
    }

    /// Claim winnings
    pub fn claim(env: Env, market_id: u64, staker: Address) -> i128 {
        staker.require_auth();

        let market = Self::get_market(env.clone(), market_id);
        
        if !market.resolved {
            panic!("Market not resolved yet");
        }

        let stake_key = ("stake", market_id, staker.clone());
        let mut stake: Stake = env.storage()
            .persistent()
            .get(&stake_key)
            .expect("No stake found");

        if stake.claimed {
            panic!("Already claimed");
        }

        // Check if won
        if stake.position != market.outcome {
            return 0; // Lost
        }

        // Calculate winnings
        let total_pool = market.total_yes + market.total_no;
        let winning_pool = if market.outcome {
            market.total_yes
        } else {
            market.total_no
        };

        let winnings = (stake.amount * total_pool) / winning_pool;

        stake.claimed = true;
        env.storage().persistent().set(&stake_key, &stake);

        winnings
    }

    /// Get market details
    pub fn get_market(env: Env, market_id: u64) -> Market {
        env.storage()
            .persistent()
            .get(&("market", market_id))
            .expect("Market not found")
    }

    /// Get stake details
    pub fn get_stake(env: Env, market_id: u64, staker: Address) -> Stake {
        env.storage()
            .persistent()
            .get(&("stake", market_id, staker))
            .expect("Stake not found")
    }

    /// Get odds for YES (returns percentage * 100)
    pub fn get_odds(env: Env, market_id: u64) -> u32 {
        let market = Self::get_market(env, market_id);
        let total = market.total_yes + market.total_no;
        
        if total == 0 {
            return 5000; // 50%
        }

        ((market.total_yes * 10000) / total) as u32
    }
}

#[cfg(test)]
mod test;
