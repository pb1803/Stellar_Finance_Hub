'use client';

import { useState } from 'react';
import { useFreighter } from '@/hooks/useFreighter';
import ChitTab from './tabs/ChitTab';
import PredictionTab from './tabs/PredictionTab';
import ArbitrageTab from './tabs/ArbitrageTab';
import ReputationTab from './tabs/ReputationTab';

type Tab = 'chit' | 'prediction' | 'arbitrage' | 'reputation';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('chit');
  const { publicKey, isAvailable, isConnected, isConnecting, error, connect, disconnect, checkFreighter } = useFreighter();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'chit', label: 'Chit Fund' },
    { id: 'prediction', label: 'Prediction' },
    { id: 'arbitrage', label: 'Arbitrage' },
    { id: 'reputation', label: 'Reputation' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">Stellar Finance Hub</h1>
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <button
                onClick={connect}
                disabled={!isAvailable || isConnecting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-gray-800 px-3 py-1 text-xs font-mono">
                  {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
                </span>
                <button
                  onClick={disconnect}
                  className="rounded-lg bg-gray-700 px-3 py-1 text-xs hover:bg-gray-600"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-2 rounded-lg bg-red-900/30 border border-red-700 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}
        {!isAvailable && (
          <div className="mt-2 rounded-lg bg-yellow-900/30 border border-yellow-700 px-4 py-2 text-sm text-yellow-400">
            <div className="font-semibold mb-1">⚠️ Freighter wallet extension not detected</div>
            <ol className="mt-1 ml-4 list-decimal text-xs space-y-1">
              <li>Install Freighter from <a href="https://www.freighter.app/" target="_blank" rel="noopener" className="underline hover:text-yellow-200">freighter.app</a></li>
              <li><strong>Enable site access:</strong> Click Freighter icon → Settings (⚙️) → Allow localhost</li>
              <li>Unlock your Freighter wallet (enter password)</li>
              <li>Click &quot;Check Again&quot; below</li>
            </ol>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={checkFreighter} 
                className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded font-medium"
              >
                🔄 Check Again
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="text-xs bg-yellow-700 hover:bg-yellow-600 px-3 py-1.5 rounded"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex">
        {/* Sidebar tabs */}
        <aside className="w-64 border-r border-gray-800 bg-gray-950 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Tab content */}
        <main className="flex-1 p-6">
          {activeTab === 'chit' && <ChitTab account={publicKey} />}
          {activeTab === 'prediction' && <PredictionTab account={publicKey} />}
          {activeTab === 'arbitrage' && <ArbitrageTab account={publicKey} />}
          {activeTab === 'reputation' && <ReputationTab account={publicKey} />}
        </main>
      </div>
    </div>
  );
}
