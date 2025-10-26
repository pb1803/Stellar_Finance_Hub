from price_fetcher import fetch_prices
from arbitrage_detector import detect_arbitrage
from trade_executor import execute_trade

print("🔄 Fetching stablecoin prices...")
prices = fetch_prices()
print("💰 Prices:", prices)

print("🔍 Checking for arbitrage opportunities...")
opportunity = detect_arbitrage(prices)

if opportunity:
    print("✅ Opportunity:", opportunity)
    print("🚀 Executing trades...")
    tx_hash_1 = execute_trade(opportunity["buy_from"], "buy", amount=10)
    tx_hash_2 = execute_trade(opportunity["sell_on"], "sell", amount=10)
    print("✅ Stellar trade hash:", tx_hash_1)
    print("🧪 Simulated Coinbase trade hash:", tx_hash_2)
else:
    print("📉 No arbitrage opportunity.")