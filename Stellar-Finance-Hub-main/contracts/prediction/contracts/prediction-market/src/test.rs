#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_create_market() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, PredictionMarket);
    let client = PredictionMarketClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let end_time = env.ledger().timestamp() + 86400; // 1 day

    let market_id = client.create_market(&creator, &1234, &end_time);
    
    let market = client.get_market(&market_id);
    assert_eq!(market.question, 1234);
    assert_eq!(market.resolved, false);
}

#[test]
fn test_stake() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, PredictionMarket);
    let client = PredictionMarketClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let staker = Address::generate(&env);
    let end_time = env.ledger().timestamp() + 86400;

    let market_id = client.create_market(&creator, &1234, &end_time);
    client.stake(&market_id, &staker, &1000, &true);

    let market = client.get_market(&market_id);
    assert_eq!(market.total_yes, 1000);
}

#[test]
fn test_resolve_and_claim() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, PredictionMarket);
    let client = PredictionMarketClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let winner = Address::generate(&env);
    let loser = Address::generate(&env);
    let end_time = env.ledger().timestamp() + 86400;

    let market_id = client.create_market(&creator, &1234, &end_time);
    
    // Stakes
    client.stake(&market_id, &winner, &1000, &true);
    client.stake(&market_id, &loser, &500, &false);
    
    // Resolve to YES
    client.resolve(&market_id, &true);
    
    // Winner claims
    let winnings = client.claim(&market_id, &winner);
    assert_eq!(winnings, 1500); // Gets entire pool
}
