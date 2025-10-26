const express = require('express');
const router = express.Router();

// In-memory reputation data (keyed by account public key)
const reputationStore = new Map();

// Seed some demo reputation
reputationStore.set('GXXXXEXAMPLE1', {
  account: 'GXXXXEXAMPLE1',
  score: 750,
  history: [
    { action: 'Joined Chit Fund', date: '2025-10-20', delta: +50 },
    { action: 'Completed Prediction Stake', date: '2025-10-22', delta: +30 },
  ],
});

reputationStore.set('GXXXXEXAMPLE2', {
  account: 'GXXXXEXAMPLE2',
  score: 820,
  history: [
    { action: 'Created Chit Fund', date: '2025-10-18', delta: +100 },
    { action: 'Arbitrage Trade', date: '2025-10-21', delta: +20 },
  ],
});

// GET /api/reputation/:account - Get reputation for an account
router.get('/:account', (req, res) => {
  const { account } = req.params;
  let rep = reputationStore.get(account);
  if (!rep) {
    // Initialize with default reputation
    rep = {
      account,
      score: 500,
      history: [],
    };
    reputationStore.set(account, rep);
  }
  res.json(rep);
});

// POST /api/reputation - Update reputation (for demo purposes)
router.post('/', (req, res) => {
  const { account, action, delta } = req.body;
  if (!account || !action || typeof delta !== 'number') {
    return res.status(400).json({ error: 'Missing account, action, or delta' });
  }

  let rep = reputationStore.get(account);
  if (!rep) {
    rep = { account, score: 500, history: [] };
    reputationStore.set(account, rep);
  }

  rep.score = Math.max(0, Math.min(1000, rep.score + delta));
  rep.history.push({ action, date: new Date().toISOString().split('T')[0], delta });

  res.json({ success: true, reputation: rep });
});

module.exports = router;
