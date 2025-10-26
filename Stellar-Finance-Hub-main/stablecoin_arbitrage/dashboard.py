import streamlit as st
from price_fetcher import fetch_prices
from arbitrage_detector import detect_arbitrage
from trade_executor import execute_trade

st.set_page_config(page_title="Stablecoin Arbitrage Dashboard", layout="centered")

st.title("💱 Stablecoin Arbitrage Tracker")
st.markdown("Real-time arbitrage opportunities using Stellar + Freighder")

# Fetch prices
prices = fetch_prices()
st.subheader("🔄 Live Prices")
st.write(prices)
# Simulate prices for testing
if st.checkbox("🧪 Simulate arbitrage opportunity"):
    prices["binance"] = 0.9997
    prices["coinbase"] = 1.002

# Error messages
if prices["binance"] is None:
    st.error("❌ Binance price unavailable. Check API or network.")
if prices["coinbase"] is None:
    st.error("❌ CoinGecko price unavailable. Arbitrage detection skipped.")

# Spread threshold slider
threshold = st.slider("📉 Minimum Spread (%)", 0.1, 5.0, 0.5)

# Detect arbitrage
opportunity = detect_arbitrage(prices, threshold=threshold)
if opportunity:
    st.subheader("📈 Arbitrage Opportunity")
    st.success(f"Buy from {opportunity['buy_from']} at {opportunity['buy_price']}, "
               f"Sell on {opportunity['sell_on']} at {opportunity['sell_price']} → "
               f"Spread: {opportunity['spread']:.4f}%")

    if st.button("🚀 Execute Trade"):
        tx_hash_1 = execute_trade(opportunity["buy_from"], "buy", amount=10)
        tx_hash_2 = execute_trade(opportunity["sell_on"], "sell", amount=10)
        st.success(f"✅ Stellar trade hash: `{tx_hash_1}`")
        st.info(f"🧪 Simulated Coinbase trade hash: `{tx_hash_2}`")
else:
    st.subheader("📉 No Arbitrage Opportunity")
    st.info("Spread too low to execute profitable trade.")