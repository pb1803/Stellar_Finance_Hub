def detect_arbitrage(prices, threshold=0.5):
    binance_price = prices.get("binance")
    coinbase_price = prices.get("coinbase")

    if not binance_price or not coinbase_price:
        return None

    spread = ((coinbase_price - binance_price) / binance_price) * 100

    if spread >= threshold:
        return {
            "buy_from": "binance",
            "buy_price": binance_price,
            "sell_on": "coinbase",
            "sell_price": coinbase_price,
            "spread": spread
        }

    return None