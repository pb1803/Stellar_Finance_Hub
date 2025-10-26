'use client';

import { useState, useEffect } from 'react';
import { ReputationContract } from '@/lib/stellar/contracts/reputation';

interface ReputationData {
  account: string;
  score: number;
  history: { action: string; date: string; delta: number }[];
}

export default function ReputationTab({ account }: { account: string | null }) {
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (account) {
      fetchReputation(account);
    } else {
      setReputation(null);
    }
  }, [account]);

  const fetchReputation = async (acc: string) => {
    setLoading(true);
    try {
      // For now, use mock API until contracts are deployed
      const res = await fetch(`http://localhost:3001/api/reputation/${acc}`);
      const data = await res.json();
      setReputation(data);
    } catch (err) {
      console.error('Failed to fetch reputation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrementReputation = async () => {
    if (!account || updating) return;
    setUpdating(true);
    
    // HACK: Use the 'priya' mock user for the demo
    const mockUserId = 'priya';

    try {
      // MODIFICATION: Changed URL to '/api/reputation-update'
      const res = await fetch(`http://localhost:3001/api/reputation-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // MODIFICATION: Send user and points, matching the backend
        body: JSON.stringify({ user: mockUserId, points: 10 }), 
      });

      const data = await res.json();
      
      if (data.success) {
        // This fetchReputation call will now get the new total score
        // including all updates from other tabs
        await fetchReputation(account); 
        alert('Reputation updated by +10 points!');
      } else {
        throw new Error(data.error || 'Failed to update on server');
      }
    } catch (err) {
      console.error('Failed to increment reputation:', err);
      alert('Failed to update reputation.');
    } finally {
      setUpdating(false);
    }
  };

  if (!account) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">On-Chain Reputation</h2>
        <div className="rounded-lg bg-yellow-900/30 border border-yellow-700 px-4 py-3 text-sm text-yellow-400">
          Connect your wallet to view your reputation score.
        </div>
      </div>
    );
  }

  if (loading) return <div>Loading reputation...</div>;

  if (!reputation) return <div>No reputation data found.</div>;

  const scoreColor = reputation.score >= 700 ? 'text-green-400' : reputation.score >= 500 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">On-Chain Reputation</h2>

      {/* Reputation Score Card */}
      <div className="rounded-lg bg-gray-800 border border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Your Reputation Score</div>
            <div className={`text-5xl font-bold ${scoreColor} mt-2`}>{reputation.score}</div>
            <div className="text-xs text-gray-500 mt-1">out of 1000</div>
          </div>
          <div className="w-32 h-32 rounded-full bg-gray-900 flex items-center justify-center border-4 border-gray-700">
            <div className="text-center">
              <div className={`text-3xl font-bold ${scoreColor}`}>{reputation.score}</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                reputation.score >= 700 ? 'bg-green-500' : reputation.score >= 500 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${(reputation.score / 1000) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0</span>
            <span>500</span>
            <span>1000</span>
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="rounded-lg bg-gray-800 border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Activity History</h3>
          <button
            onClick={handleIncrementReputation}
            disabled={!account || updating}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Test +10 Points'}
          </button>
        </div>
        {reputation.history.length === 0 ? (
          <div className="text-sm text-gray-400">No activity yet. Start using the platform to build your reputation!</div>
        ) : (
          <div className="space-y-3">
            {reputation.history.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                <div>
                  <div className="text-sm font-medium text-white">{item.action}</div>
                  <div className="text-xs text-gray-500">{item.date}</div>
                </div>
                <div className={`text-sm font-semibold ${item.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.delta >= 0 ? '+' : ''}{item.delta}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-lg bg-blue-900/30 border border-blue-700 px-4 py-3 text-sm text-blue-400">
        <div className="font-medium mb-1">How Reputation Works</div>
        <ul className="text-xs space-y-1 text-gray-300">
          <li>• Join or create chit funds: +10 to +100 points</li>
          <li>• Participate in prediction markets: +20 to +50 points</li>
          <li>• Complete arbitrage trades: +10 to +30 points</li>
          <li>• Your reputation affects your trust score and potential rewards</li>
        </ul>
      </div>
    </div>
  );
}
