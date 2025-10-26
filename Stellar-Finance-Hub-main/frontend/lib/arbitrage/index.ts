// Arbitrage Agent - Off-chain service for detecting arbitrage opportunities

export interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  profitPercent: number;
  volume: number;
  confidence: number;
  timestamp: number;
}

export interface DexPrice {
  exchange: string;
  pair: string;
  bid: number;
  ask: number;
  volume24h: number;
  lastUpdate: number;
}

export class ArbitrageAgent {
  private opportunities: ArbitrageOpportunity[] = [];
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start monitoring for arbitrage opportunities
   */
  start(intervalMs: number = 30000): void {
    if (this.isRunning) {
      console.log('Arbitrage agent already running');
      return;
    }

    console.log('Starting arbitrage agent...');
    this.isRunning = true;

    // Initial scan
    this.scanOpportunities();

    // Periodic scanning
    this.intervalId = setInterval(() => {
      this.scanOpportunities();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Arbitrage agent stopped');
  }

  /**
   * Scan for arbitrage opportunities
   */
  private async scanOpportunities(): Promise<void> {
    try {
      console.log('Scanning for arbitrage opportunities...');

      // Fetch prices from multiple DEXs
      const prices = await this.fetchDexPrices();

      // Find arbitrage opportunities
      const newOpportunities = this.findArbitrage(prices);

      // Filter profitable opportunities (> 0.5% profit after fees)
      this.opportunities = newOpportunities.filter(
        opp => opp.profitPercent > 0.5
      );

      console.log(`Found ${this.opportunities.length} arbitrage opportunities`);
    } catch (error) {
      console.error('Error scanning arbitrage opportunities:', error);
    }
  }

  /**
   * Fetch prices from multiple DEXs
   */
  private async fetchDexPrices(): Promise<DexPrice[]> {
    // Mock data - In production, fetch from real DEX APIs
    const mockPrices: DexPrice[] = [
      {
        exchange: 'StellarX',
        pair: 'XLM/USDC',
        bid: 0.095,
        ask: 0.096,
        volume24h: 1000000,
        lastUpdate: Date.now()
      },
      {
        exchange: 'Aquarius',
        pair: 'XLM/USDC',
        bid: 0.0955,
        ask: 0.0965,
        volume24h: 800000,
        lastUpdate: Date.now()
      },
      {
        exchange: 'StellarX',
        pair: 'BTC/USDC',
        bid: 43500,
        ask: 43550,
        volume24h: 5000000,
        lastUpdate: Date.now()
      },
      {
        exchange: 'Aquarius',
        pair: 'BTC/USDC',
        bid: 43520,
        ask: 43580,
        volume24h: 4500000,
        lastUpdate: Date.now()
      }
    ];

    return mockPrices;
  }

  /**
   * Find arbitrage opportunities from price data
   */
  private findArbitrage(prices: DexPrice[]): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];

    // Group prices by pair
    const pairGroups = new Map<string, DexPrice[]>();
    for (const price of prices) {
      if (!pairGroups.has(price.pair)) {
        pairGroups.set(price.pair, []);
      }
      pairGroups.get(price.pair)!.push(price);
    }

    // Find arbitrage for each pair
    for (const [pair, pairPrices] of pairGroups) {
      if (pairPrices.length < 2) continue;

      // Compare all exchange combinations
      for (let i = 0; i < pairPrices.length; i++) {
        for (let j = i + 1; j < pairPrices.length; j++) {
          const priceA = pairPrices[i];
          const priceB = pairPrices[j];

          // Check if we can buy on A and sell on B
          const profitAB = this.calculateProfit(priceA.ask, priceB.bid);
          if (profitAB > 0) {
            opportunities.push({
              id: `${priceA.exchange}-${priceB.exchange}-${pair}-${Date.now()}`,
              pair,
              buyExchange: priceA.exchange,
              sellExchange: priceB.exchange,
              buyPrice: priceA.ask,
              sellPrice: priceB.bid,
              profit: profitAB,
              profitPercent: (profitAB / priceA.ask) * 100,
              volume: Math.min(priceA.volume24h, priceB.volume24h) * 0.01, // 1% of min volume
              confidence: this.calculateConfidence(priceA, priceB),
              timestamp: Date.now()
            });
          }

          // Check if we can buy on B and sell on A
          const profitBA = this.calculateProfit(priceB.ask, priceA.bid);
          if (profitBA > 0) {
            opportunities.push({
              id: `${priceB.exchange}-${priceA.exchange}-${pair}-${Date.now()}`,
              pair,
              buyExchange: priceB.exchange,
              sellExchange: priceA.exchange,
              buyPrice: priceB.ask,
              sellPrice: priceA.bid,
              profit: profitBA,
              profitPercent: (profitBA / priceB.ask) * 100,
              volume: Math.min(priceA.volume24h, priceB.volume24h) * 0.01,
              confidence: this.calculateConfidence(priceB, priceA),
              timestamp: Date.now()
            });
          }
        }
      }
    }

    // Sort by profit percent descending
    return opportunities.sort((a, b) => b.profitPercent - a.profitPercent);
  }

  /**
   * Calculate profit after fees
   */
  private calculateProfit(buyPrice: number, sellPrice: number): number {
    const FEE_PERCENT = 0.003; // 0.3% fee
    const netSellPrice = sellPrice * (1 - FEE_PERCENT);
    const netBuyPrice = buyPrice * (1 + FEE_PERCENT);
    return netSellPrice - netBuyPrice;
  }

  /**
   * Calculate confidence score (0-100)
   */
  private calculateConfidence(priceA: DexPrice, priceB: DexPrice): number {
    // Factors:
    // 1. Volume (higher is better)
    // 2. Recency (newer is better)
    // 3. Spread (tighter is better)

    const volumeScore = Math.min(
      ((priceA.volume24h + priceB.volume24h) / 10000000) * 40,
      40
    );

    const now = Date.now();
    const avgAge = ((now - priceA.lastUpdate) + (now - priceB.lastUpdate)) / 2;
    const recencyScore = Math.max(30 - (avgAge / 1000 / 60), 0); // Decay over minutes

    const avgSpread = ((priceA.ask - priceA.bid) / priceA.bid + (priceB.ask - priceB.bid) / priceB.bid) / 2;
    const spreadScore = Math.max(30 - avgSpread * 100, 0);

    return Math.min(volumeScore + recencyScore + spreadScore, 100);
  }

  /**
   * Get current opportunities
   */
  getOpportunities(): ArbitrageOpportunity[] {
    return [...this.opportunities];
  }

  /**
   * Get top N opportunities
   */
  getTopOpportunities(count: number = 5): ArbitrageOpportunity[] {
    return this.opportunities.slice(0, count);
  }

  /**
   * Execute arbitrage trade
   */
  async executeTrade(opportunityId: string, userAddress: string): Promise<string> {
    const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
    
    if (!opportunity) {
      throw new Error('Opportunity not found or expired');
    }

    console.log('Executing arbitrage trade:', opportunity);

    // TODO: Implement actual trade execution
    // 1. Buy on source DEX
    // 2. Transfer assets
    // 3. Sell on destination DEX
    // 4. Handle errors and rollback if needed

    return 'mock-arbitrage-tx-hash';
  }

  /**
   * Simulate trade to estimate actual profit
   */
  async simulateTrade(opportunityId: string, amount: number): Promise<{
    estimatedProfit: number;
    estimatedProfitPercent: number;
    gasEstimate: number;
    netProfit: number;
  }> {
    const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
    
    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    const estimatedProfit = opportunity.profit * amount;
    const gasEstimate = 0.01; // Estimated gas in USD
    const netProfit = estimatedProfit - gasEstimate;

    return {
      estimatedProfit,
      estimatedProfitPercent: opportunity.profitPercent,
      gasEstimate,
      netProfit
    };
  }
}

// Export singleton instance
export const arbitrageAgent = new ArbitrageAgent();
