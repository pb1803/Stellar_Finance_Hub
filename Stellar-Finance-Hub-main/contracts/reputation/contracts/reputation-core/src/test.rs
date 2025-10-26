#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_reputation_initialization() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ReputationCore);
    let client = ReputationCoreClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    
    // Default score should be 500
    let score = client.get_reputation(&user);
    assert_eq!(score, 500);
}

#[test]
fn test_update_reputation() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, ReputationCore);
    let client = ReputationCoreClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    
    // Increment reputation
    client.increment(&user, &50);
    assert_eq!(client.get_reputation(&user), 550);
    
    // Decrement reputation
    client.decrement(&user, &30);
    assert_eq!(client.get_reputation(&user), 520);
}

#[test]
fn test_reputation_bounds() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, ReputationCore);
    let client = ReputationCoreClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    
    // Try to exceed max (1000)
    client.increment(&user, &600);
    assert_eq!(client.get_reputation(&user), 1000);
    
    // Try to go below min (0)
    client.decrement(&user, &2000);
    assert_eq!(client.get_reputation(&user), 0);
}

#[test]
fn test_meets_threshold() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, ReputationCore);
    let client = ReputationCoreClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    
    // Default 500 meets threshold of 400
    assert_eq!(client.meets_threshold(&user, &400), true);
    
    // Default 500 doesn't meet threshold of 600
    assert_eq!(client.meets_threshold(&user, &600), false);
}
