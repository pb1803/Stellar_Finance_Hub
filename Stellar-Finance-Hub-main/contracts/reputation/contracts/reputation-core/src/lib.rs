#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReputationData {
    pub score: u32,
    pub total_interactions: u32,
    pub last_updated: u64,
}

#[contract]
pub struct ReputationCore;

#[contractimpl]
impl ReputationCore {
    /// Initialize the contract
    pub fn initialize(env: Env) {
        // Contract initialization logic if needed
        env.storage().instance().set(&"initialized", &true);
    }

    /// Get reputation score for an address
    pub fn get_reputation(env: Env, account: Address) -> u32 {
        let key = ("reputation", account.clone());
        env.storage()
            .persistent()
            .get::<(_, Address), ReputationData>(&key)
            .map(|data| data.score)
            .unwrap_or(500) // Default score: 500
    }

    /// Update reputation score (can be called by authorized contracts)
    pub fn update_reputation(
        env: Env,
        account: Address,
        delta: i32, // Positive or negative change
    ) {
        account.require_auth();

        let key = ("reputation", account.clone());
        let current = env.storage()
            .persistent()
            .get::<(_, Address), ReputationData>(&key)
            .unwrap_or(ReputationData {
                score: 500,
                total_interactions: 0,
                last_updated: 0,
            });

        // Calculate new score with bounds [0, 1000]
        let new_score = if delta < 0 {
            current.score.saturating_sub((-delta) as u32)
        } else {
            (current.score + delta as u32).min(1000)
        };

        let updated = ReputationData {
            score: new_score,
            total_interactions: current.total_interactions + 1,
            last_updated: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&key, &updated);
    }

    /// Get full reputation data
    pub fn get_reputation_data(env: Env, account: Address) -> ReputationData {
        let key = ("reputation", account.clone());
        env.storage()
            .persistent()
            .get::<(_, Address), ReputationData>(&key)
            .unwrap_or(ReputationData {
                score: 500,
                total_interactions: 0,
                last_updated: 0,
            })
    }

    /// Increment reputation (positive action)
    pub fn increment(env: Env, account: Address, amount: u32) {
        account.require_auth();
        Self::update_reputation(env, account, amount as i32);
    }

    /// Decrement reputation (negative action)
    pub fn decrement(env: Env, account: Address, amount: u32) {
        account.require_auth();
        Self::update_reputation(env, account, -(amount as i32));
    }

    /// Check if account meets minimum reputation threshold
    pub fn meets_threshold(env: Env, account: Address, threshold: u32) -> bool {
        Self::get_reputation(env, account) >= threshold
    }
}

#[cfg(test)]
mod test;
