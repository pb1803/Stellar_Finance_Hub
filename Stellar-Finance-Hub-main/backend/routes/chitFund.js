const express = require('express');
const router = express.Router();

// In-memory chit funds
const chitFunds = [
  {
    id: 'cf-1',
    name: 'Community Savings Pool',
    creator: 'GXXXXEXAMPLECREATOR',
    members: [
      { account: 'GXXXXEXAMPLECREATOR', pledgedAmount: 5000 },
      { account: 'GXXXXEXAMPLEMEMBER1', pledgedAmount: 5000 },
    ],
    potBalance: 10000,
    cycleLength: 30, // days
    status: 'active',
  },
  {
    id: 'cf-2',
    name: 'Monthly Chit Fund',
    creator: 'GXXXXEXAMPLECREATOR2',
    members: [
      { account: 'GXXXXEXAMPLECREATOR2', pledgedAmount: 10000 },
    ],
    potBalance: 10000,
    cycleLength: 30,
    status: 'active',
  },
];

// GET /api/chit-funds - List all chit funds
router.get('/', (req, res) => {
  res.json(chitFunds);
});

// POST /api/chit-funds - Create or join a chit fund
router.post('/', (req, res) => {
  const { action, account, fundId, name, pledgedAmount, cycleLength } = req.body;

  if (action === 'create') {
    if (!account || !name || !pledgedAmount || !cycleLength) {
      return res.status(400).json({ error: 'Missing fields for create action' });
    }
    const newFund = {
      id: `cf-${Date.now()}`,
      name,
      creator: account,
      members: [{ account, pledgedAmount }],
      potBalance: pledgedAmount,
      cycleLength,
      status: 'active',
    };
    chitFunds.push(newFund);
    return res.json({ success: true, fund: newFund });
  }

  if (action === 'join') {
    if (!account || !fundId || !pledgedAmount) {
      return res.status(400).json({ error: 'Missing fields for join action' });
    }
    const fund = chitFunds.find(f => f.id === fundId);
    if (!fund) {
      return res.status(404).json({ error: 'Fund not found' });
    }
    if (fund.members.some(m => m.account === account)) {
      return res.status(400).json({ error: 'Already a member' });
    }
    fund.members.push({ account, pledgedAmount });
    fund.potBalance += pledgedAmount;
    return res.json({ success: true, fund });
  }

  return res.status(400).json({ error: 'Invalid action. Use "create" or "join"' });
});

module.exports = router;
