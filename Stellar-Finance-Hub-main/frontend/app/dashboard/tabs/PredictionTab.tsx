'use client';

import { useState, useEffect } from 'react';
import { PredictionMarketContract } from '@/lib/stellar/contracts/prediction';

interface PredictionMarket {
  id: string;
  question: string;
  outcomes: string[];
  stakes: { account: string; outcome: string; amount: number }[];
  resolution: string;
  winner: string | null;
}

export default function PredictionTab({ account }: { account: string | null }) {
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOutcomes, setNewOutcomes] = useState('Yes,No');
  const [creating, setCreating] = useState(false);
  const [staking, setStaking] = useState<string | null>(null);
  const [predictionContract] = useState(() => new PredictionMarketContract(account || ''));

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/predictions');
      const data = await res.json();
      setMarkets(data);
    } catch (err) {
      console.error('Failed to fetch markets:', err);
    } finally {
      setLoading(false);
    }
  };

const handleCreate = async () => {
    if (!account || !newQuestion || !newOutcomes || creating) return;
    const outcomes = newOutcomes.split(',').map(o => o.trim()).filter(Boolean);
    if (outcomes.length < 2) {
      alert('Please provide at least 2 outcomes separated by commas');
      return;
    }
    setCreating(true);
    try {
      // MODIFICATION: Removed smart contract call.
      // We will only sync with the mock backend.
      
      const res = await fetch('http://localhost:3001/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          account,
          question: newQuestion,
          outcomes,
          // txHash has been removed
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setMarkets([...markets, data.market]);
        setShowCreateModal(false);
        setNewQuestion('');
        setNewOutcomes('Yes,No');
        alert('Prediction market created successfully (mock)!'); // MODIFICATION: Changed alert text
      } else {
        throw new Error(data.error || 'Mock server returned an error');
      }
    } catch (err) {
      console.error('Failed to create market (mock):', err);
      alert(`Failed to create market: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleStake = async (marketId: string, outcome: string) => {
    if (!account || staking) return;
    const amount = prompt(`Enter stake amount for "${outcome}":`);
    if (!amount) return;
    setStaking(marketId);
    try {
      // MODIFICATION: Removed smart contract call.
      // We will only sync with the mock backend.
      
      const res = await fetch('http://localhost:3001/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stake',
          account,
          marketId,
          outcome,
          amount: Number(amount),
          // txHash has been removed
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setMarkets(markets.map(m => (m.id === marketId ? data.market : m)));
        alert('Stake placed successfully (mock)!'); // MODIFICATION: Changed alert text
        updateReputation(25); // Add 25 points for staking
      } else {
        throw new Error(data.error || 'Mock server returned an error');
      }
    } catch (err) {
      console.error('Failed to stake (mock):', err);
      alert(`Failed to stake: ${err instanceof Error ? err.message : String(err)}`); // MODIFICATION: Show better error
    } finally {
      setStaking(null);
    }
  };

  // ADD THIS NEW HELPER FUNCTION
  const updateReputation = async (points: number) => {
    // HACK: The mock backend's 'users' map is keyed by 'priya' or 'rahul',
    // not the Stellar public key. We'll hard-code 'priya' for this demo
    // to ensure the score we see on the Reputation tab actually changes.
    const mockUserId = 'priya'; 

    try {
      const res = await fetch('http://localhost:3001/api/reputation-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: mockUserId, // Send the hard-coded ID
          points: points,
        }),
      });

      if (res.ok) {
        console.log(`Reputation updated for ${mockUserId} by ${points} points.`);
      } else {
        console.error('Failed to update reputation on mock server.');
      }
    } catch (err) {
      console.error("Failed to update reputation:", err);
    }
  };

  if (loading) return <div>Loading prediction markets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Prediction Markets</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!account}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Create Market
        </button>
      </div>

      {!account && (
        <div className="rounded-lg bg-yellow-900/30 border border-yellow-700 px-4 py-3 text-sm text-yellow-400">
          Connect your wallet to create markets or stake.
        </div>
      )}

      <div className="space-y-4">
        {markets.map((market) => {
          const totalStaked = market.stakes.reduce((sum, s) => sum + s.amount, 0);
          const outcomeStats = market.outcomes.map(outcome => {
            const outcomeStakes = market.stakes.filter(s => s.outcome === outcome);
            const outcomeTotal = outcomeStakes.reduce((sum, s) => sum + s.amount, 0);
            return { outcome, total: outcomeTotal, percentage: totalStaked > 0 ? (outcomeTotal / totalStaked * 100).toFixed(1) : '0' };
          });

          return (
            <div key={market.id} className="rounded-lg bg-gray-800 border border-gray-700 p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-400">{market.question}</h3>
                <div className="mt-1 text-sm text-gray-400">
                  Status: <span className={market.resolution === 'unresolved' ? 'text-yellow-400' : 'text-green-400'}>{market.resolution}</span>
                  {market.winner && <span className="ml-2">Winner: {market.winner}</span>}
                </div>
              </div>

              <div className="space-y-2">
                {outcomeStats.map(({ outcome, total, percentage }) => (
                  <div key={outcome} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{outcome}</span>
                        <span className="text-xs text-gray-400">{total.toLocaleString()} USDC ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleStake(market.id, outcome)}
                      disabled={!account || market.resolution !== 'unresolved' || staking === market.id}
                      className="ml-4 rounded-lg bg-gray-700 px-3 py-1 text-xs font-medium hover:bg-gray-600 disabled:opacity-50"
                    >
                      {staking === market.id ? 'Staking...' : 'Stake'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Create Prediction Market</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Question</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white"
                placeholder="Will X happen by Y date?"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Outcomes (comma-separated)</label>
              <input
                type="text"
                value={newOutcomes}
                onChange={(e) => setNewOutcomes(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white"
                placeholder="Yes,No"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? 'Creating on-chain...' : 'Create'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
