// Contract addresses - Update these after deployment
export const CONTRACTS = {
  REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT || '',
  CHITFUND: process.env.NEXT_PUBLIC_CHITFUND_CONTRACT || '',
  PREDICTION: process.env.NEXT_PUBLIC_PREDICTION_CONTRACT || '',
};

export const STELLAR_CONFIG = {
  NETWORK: (process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet') as 'testnet' | 'futurenet' | 'mainnet',
  RPC_URL: process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
  HORIZON_URL: process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org',
};

export const NETWORK_PASSPHRASES = {
  testnet: 'Test SDF Network ; September 2015',
  futurenet: 'Test SDF Future Network ; October 2022',
  mainnet: 'Public Global Stellar Network ; September 2015',
};
