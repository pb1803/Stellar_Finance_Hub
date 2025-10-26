const express = require('express');
const router = express.Router();

// Mock AI arbitrage suggestions
const arbitrageSuggestions = [
  {
    id: 'arb-1',
    description: 'Buy XLM on DEX A, sell on DEX B',
    expectedProfit: 150.25,
    confidence: 0.87,
    route: ['DEX_A', 'DEX_B'],
  },
  {
    id: 'arb-2',
    description: 'USDC arbitrage via Stellar <> Ethereum bridge',
    expectedProfit: 85.40,
    confidence: 0.75,
    route: ['Stellar', 'Bridge', 'Ethereum'],
  },
  {
    id: 'arb-3',
    description: 'Exploit price difference on BTC/USDC pair',
    expectedProfit: 220.00,
    confidence: 0.92,
    route: ['CEX_1', 'CEX_2'],
  },
];

// GET /api/arbitrage - List AI suggestions
router.get('/', (req, res) => {
  res.json(arbitrageSuggestions);
});

// POST /api/arbitrage/simulate - Simulate an auto-trade
router.post('/simulate', (req, res) => {
  const { suggestionId, account } = req.body;
  if (!suggestionId || !account) {
    return res.status(400).json({ error: 'Missing suggestionId or account' });
  }
  const suggestion = arbitrageSuggestions.find(s => s.id === suggestionId);
  if (!suggestion) {
    return res.status(404).json({ error: 'Suggestion not found' });
  }

  // Mock simulation result
  const actualProfit = suggestion.expectedProfit * (0.9 + Math.random() * 0.2); // 90-110% of expected
  const result = {
    success: true,
    suggestionId,
    account,
    expectedProfit: suggestion.expectedProfit,
    actualProfit: Number(actualProfit.toFixed(2)),
    timestamp: new Date().toISOString(),
  };

  return res.json(result);
});

module.exports = router;
