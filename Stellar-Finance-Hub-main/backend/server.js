const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const chitFundRoutes = require('./routes/chitFund');
const predictionRoutes = require('./routes/prediction');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Mount new routes
app.use('/api/chit-funds', chitFundRoutes);
app.use('/api/predictions', predictionRoutes);


// Utility
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

// In-memory state
const users = new Map();

// Initialize users: priya, rahul
const now = () => Math.floor(Date.now() / 1000);
users.set('priya', {
	id: 'priya',
	balance: 50000,
	stake: 0,
	reputation: 500,
	yieldAccrued: 0,
	lastYieldTime: now(),
});

users.set('rahul', {
	id: 'rahul',
	balance: 100000,
	stake: 0,
	reputation: 610,
	yieldAccrued: 0,
	lastYieldTime: now(),
});

// Constants for yield calculations
const APY = 0.09; // 9% APY
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

// Routes

// Get user data
app.get('/api/user/:id', (req, res) => {
	const id = req.params.id;
	const user = users.get(id);
	if (!user) return res.status(404).json({ error: 'User not found' });
	return res.json(user);
});

// ADD THIS ROUTE TO server.js


// Join chit: decreases balance, adds 10 reputation
app.post('/api/join-chit', (req, res) => {
	const { user: userId, amount } = req.body;
	if (!userId || typeof amount !== 'number') {
		return res.status(400).json({ error: 'Invalid request, provide user and amount (number)' });
	}
	const user = users.get(userId);
	if (!user) return res.status(404).json({ error: 'User not found' });
	if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });
	if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

	user.balance -= amount;
	user.reputation = clamp(user.reputation + 10, 300, 900);

	return res.json({ success: true, user });
});

// Stake: move amount from balance to stake
app.post('/api/stake', (req, res) => {
	const { user: userId, amount } = req.body;
	if (!userId || typeof amount !== 'number') {
		return res.status(400).json({ error: 'Invalid request, provide user and amount (number)' });
	}
	const user = users.get(userId);
	if (!user) return res.status(404).json({ error: 'User not found' });
	if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });
	if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

	user.balance -= amount;
	user.stake += amount;

	return res.json({ success: true, user });
});

// Reputation update: add points and clamp between 300 and 900
app.post('/api/reputation-update', (req, res) => {
	const { user: userId, points } = req.body;
	if (!userId || typeof points !== 'number') {
		return res.status(400).json({ error: 'Invalid request, provide user and points (number)' });
	}
	const user = users.get(userId);
	if (!user) return res.status(404).json({ error: 'User not found' });

	user.reputation = clamp(user.reputation + points, 300, 900);

	return res.json({ success: true, user });
});

// ADD THIS NEW ROUTE:
// This will fix the 'Failed to update reputation' error on the Reputation Tab
app.get('/api/reputation/:account', (req, res) => {
  const { account } = req.params;
  console.log(`[SERVER] GET /api/reputation for: ${account}`);

  // We use the hard-coded 'priya' user to match the rest of the demo
  const user = users.get('priya'); 

  if (!user) {
    // Fallback in case 'priya' is not found
    return res.json({
      account: account,
      score: 500,
      history: []
    });
  }

  // Return 'priya's' data
  res.json({
    account: user.id,
    score: user.reputation,
    history: [
      // This is still mock, but you can see it's working
      { action: "Joined Chit Fund", delta: 10, date: "2025-10-26" },
      { action: "Staked on Market", delta: 25, date: "2025-10-25" }
    ]
  });
});

// Yield simulation: increases user's yieldAccrued based on stake and time elapsed
app.get('/api/yield/:user', (req, res) => {
	const userId = req.params.user;
	const user = users.get(userId);
	if (!user) return res.status(404).json({ error: 'User not found' });

	const nowSec = now();
	const elapsed = Math.max(0, nowSec - (user.lastYieldTime || nowSec));
	// yield = stake * APY * (elapsedSeconds / secondsPerYear)
	const yieldSinceLast = user.stake * APY * (elapsed / SECONDS_PER_YEAR);
	// accumulate
	user.yieldAccrued += yieldSinceLast;
	user.lastYieldTime = nowSec;

	return res.json({
		success: true,
		user: userId,
		yieldSinceLast: Number(yieldSinceLast.toFixed(8)),
		yieldAccrued: Number(user.yieldAccrued.toFixed(8)),
		elapsedSeconds: elapsed,
	});
});

// ADD THIS NEW ROUTE:
app.get('/api/arbitrage-logs', async (req, res) => {
  console.log('[Node.js] GET /api/arbitrage-logs -> Calling Python AI');
  try {
    // Call your new Python API
    const response = await fetch('http://localhost:5000/api/opportunities');

    if (!response.ok) {
      throw new Error(`Python API responded with ${response.status}`);
    }

    const data = await response.json();

    // Forward the 'opportunities' array from Python to the frontend
    res.json(data.opportunities || []);

  } catch (error) {
    console.error("Error fetching from Python API:", error.message);
    res.status(500).json({ error: 'Failed to fetch from AI service' });
  }
});

// Default route
app.get('/', (req, res) => res.send('Stellar Finance Hub backend running'));

// --- ADD THESE NEW ARBITRAGE ROUTES ---

// This route forwards the request to your Python API
app.get('/api/arbitrage-logs', async (req, res) => {
  console.log('[SERVER] GET /api/arbitrage-logs -> calling Python AI');
  try {
    // Call your new Python API
    const response = await fetch('http://localhost:5000/api/opportunities');

    if (!response.ok) {
      throw new Error(`Python API responded with ${response.status}`);
    }

    const data = await response.json();

    // Transform data if needed, or just send it
    // The frontend expects an array, but your API returns { success: true, opportunities: [...] }
    // So we send the 'opportunities' array.
    res.json(data.opportunities || []);

  } catch (error) {
    console.error("Error fetching from Python API:", error.message);
    res.status(500).json({ error: 'Failed to fetch from AI service' });
  }
});

// This route simulates a trade
app.post('/api/arbitrage/simulate', async (req, res) => {
  console.log('[SERVER] POST /api/arbitrage/simulate -> calling Python AI');
  try {
    const response = await fetch('http://localhost:5000/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body) // Forward the frontend's request body
    });

    if (!response.ok) {
      throw new Error(`Python API responded with ${response.status}`);
    }

    const data = await response.json();
    res.json(data); // Forward the Python API's response

  } catch (error) {
    console.error("Error simulating on Python API:", error.message);
    res.status(500).json({ error: 'Failed to simulate on AI service' });
  }
});
// ADD THIS NEW ROUTE FOR THE SIMULATE BUTTON:
app.post('/api/arbitrage/simulate', async (req, res) => {
  console.log('[Node.js] POST /api/arbitrage/simulate -> Calling Python AI');
  try {
    const response = await fetch('http://localhost:5000/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body) // Forward the frontend's request body
    });

    if (!response.ok) {
      throw new Error(`Python API responded with ${response.status}`);
    }

    const data = await response.json();
    res.json(data); // Forward the Python API's response

  } catch (error) {
    console.error("Error simulating on Python API:", error.message);
    res.status(500).json({ error: 'Failed to simulate on AI service' });
  }
});

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
