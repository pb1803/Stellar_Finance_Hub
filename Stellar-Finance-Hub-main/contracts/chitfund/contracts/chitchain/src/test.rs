#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_create_fund() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, ChitChain);
    let client = ChitChainClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let contribution = 1000;
    let cycle_length = 30;
    let max_members = 10;

    let fund_id = client.create_fund(&creator, &contribution, &cycle_length, &max_members);
    
    let fund = client.get_fund(&fund_id);
    assert_eq!(fund.contribution, contribution);
    assert_eq!(fund.cycle_length, cycle_length);
    assert_eq!(fund.status, 0); // pending
}

#[test]
fn test_join_fund() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, ChitChain);
    let client = ChitChainClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let member = Address::generate(&env);

    let fund_id = client.create_fund(&creator, &1000, &30, &10);
    client.join_fund(&fund_id, &member);

    let fund = client.get_fund(&fund_id);
    assert_eq!(fund.members.len(), 2);
}

#[test]
fn test_contribute() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, ChitChain);
    let client = ChitChainClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let fund_id = client.create_fund(&creator, &1000, &30, &10);
    
    client.contribute(&fund_id, &creator, &1000);
    
    let fund = client.get_fund(&fund_id);
    assert_eq!(fund.pot_balance, 1000);
}
