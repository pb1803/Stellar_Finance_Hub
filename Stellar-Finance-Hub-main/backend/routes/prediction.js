const express = require('express');
const router = express.Router();

// In-memory prediction markets
const predictionMarkets = [
  {
    id: 'pm-1',
    question: 'Will BTC surpass $100K by end of 2025?',
    outcomes: ['Yes', 'No'],
    stakes: [
      { account: 'GXXXXEXAMPLE1', outcome: 'Yes', amount: 5000 },
      { account: 'GXXXXEXAMPLE2', outcome: 'No', amount: 3000 },
    ],
    resolution: 'unresolved', // unresolved | resolved
    winner: null,
  },
  {
    id: 'pm-2',
    question: 'Will ETH reach $5K in Q1 2026?',
    outcomes: ['Yes', 'No'],
    stakes: [],
    resolution: 'unresolved',
    winner: null,
  },
];

// GET /api/predictions - List all prediction markets
router.get('/', (req, res) => {
  res.json(predictionMarkets);
});

// POST /api/predictions - Create or stake in a prediction market
router.post('/', (req, res) => {
  const { action, account, marketId, question, outcomes, outcome, amount } = req.body;

  if (action === 'create') {
    if (!account || !question || !outcomes || !Array.isArray(outcomes) || outcomes.length < 2) {
      return res.status(400).json({ error: 'Invalid fields for create action' });
    }
    const newMarket = {
      id: `pm-${Date.now()}`,
      question,
      outcomes,
      stakes: [],
      resolution: 'unresolved',
      winner: null,
    };
    predictionMarkets.push(newMarket);
    return res.json({ success: true, market: newMarket });
  }

  if (action === 'stake') {
    if (!account || !marketId || !outcome || !amount) {
      return res.status(400).json({ error: 'Missing fields for stake action' });
    }
    const market = predictionMarkets.find(m => m.id === marketId);
    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }
    if (!market.outcomes.includes(outcome)) {
      return res.status(400).json({ error: 'Invalid outcome' });
    }
    market.stakes.push({ account, outcome, amount });
    return res.json({ success: true, market });
  }

  return res.status(400).json({ error: 'Invalid action. Use "create" or "stake"' });
});

module.exports = router;
