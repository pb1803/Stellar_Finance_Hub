'use client';

import { useState, useEffect } from 'react';
import { ChitFundContract } from '@/lib/stellar/contracts/chitfund';

interface ChitFund {
  id: string;
  name: string;
  creator: string;
  members: { account: string; pledgedAmount: number }[];
  potBalance: number;
  cycleLength: number;
  status: string;
}

export default function ChitTab({ account }: { account: string | null }) {
  const [funds, setFunds] = useState<ChitFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFundName, setNewFundName] = useState('');
  const [newPledgeAmount, setNewPledgeAmount] = useState('');
  const [newCycleLength, setNewCycleLength] = useState('30');
  const [creating, setCreating] = useState(false);
  const [chitContract] = useState(() => new ChitFundContract(account || ''));

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      // Fetch from backend API (which could query contract in future)
      const res = await fetch('http://localhost:3001/api/chit-funds');
      const data = await res.json();
      setFunds(data);
    } catch (err) {
      console.error('Failed to fetch chit funds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!account || !newFundName || !newPledgeAmount || creating) return;
    setCreating(true);
    try {
      // MODIFICATION: Removed smart contract call.
      // We will only sync with the mock backend.

      const res = await fetch('http://localhost:3001/api/chit-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          account,
          name: newFundName,
          pledgedAmount: Number(newPledgeAmount),
          cycleLength: Number(newCycleLength),
          // txHash has been removed
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFunds([...funds, data.fund]);
        setShowCreateModal(false);
        setNewFundName('');
        setNewPledgeAmount('');
        alert('Chit fund created successfully (mock)!');
        
        // ADD THIS CALL (from step c):
        updateReputation(10); // Add 10 points for creating
        
      } else {
        throw new Error(data.error || 'Mock server returned an error');
      }
    } catch (err) {
      console.error('Failed to create fund (mock):', err);
      alert(`Failed to create fund: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (fundId: string) => {
    if (!account) return;
    const pledgeAmount = prompt('Enter pledge amount:');
    if (!pledgeAmount) return;
    try {
      const res = await fetch('http://localhost:3001/api/chit-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          account,
          fundId,
          pledgedAmount: Number(pledgeAmount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFunds(funds.map(f => (f.id === fundId ? data.fund : f)));
        updateReputation(10); // Add 10 points for joining
      }
    } catch (err) {
      console.error('Failed to join fund:', err);
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

  if (loading) return <div>Loading chit funds...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Chit Funds</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!account}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Create Fund
        </button>
      </div>

      {!account && (
        <div className="rounded-lg bg-yellow-900/30 border border-yellow-700 px-4 py-3 text-sm text-yellow-400">
          Connect your wallet to create or join chit funds.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {funds.map((fund) => (
          <div key={fund.id} className="rounded-lg bg-gray-800 border border-gray-700 p-6 space-y-3">
            <h3 className="text-lg font-semibold text-blue-400">{fund.name}</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <div>Pot Balance: <span className="text-white">{fund.potBalance.toLocaleString()} USDC</span></div>
              <div>Members: <span className="text-white">{fund.members.length}</span></div>
              <div>Cycle Length: <span className="text-white">{fund.cycleLength} days</span></div>
              <div>Status: <span className={fund.status === 'active' ? 'text-green-400' : 'text-gray-400'}>{fund.status}</span></div>
            </div>
            <button
              onClick={() => handleJoin(fund.id)}
              disabled={!account || fund.members.some(m => m.account === account)}
              className="w-full rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-600 disabled:opacity-50"
            >
              {fund.members.some(m => m.account === account) ? 'Already Joined' : 'Join Fund'}
            </button>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Create Chit Fund</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fund Name</label>
              <input
                type="text"
                value={newFundName}
                onChange={(e) => setNewFundName(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white"
                placeholder="My Savings Pool"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Pledge Amount (USDC)</label>
              <input
                type="number"
                value={newPledgeAmount}
                onChange={(e) => setNewPledgeAmount(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white"
                placeholder="5000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cycle Length (days)</label>
              <input
                type="number"
                value={newCycleLength}
                onChange={(e) => setNewCycleLength(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white"
                placeholder="30"
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
