import requests
from config import EXCHANGES, THRESHOLD

def fetch_prices():
    prices = {}
    for name, url in EXCHANGES.items():
        try:
            res = requests.get(url).json()

            if name.lower() == "binance" and "price" in res:
                price = float(res["price"])

            elif name.lower() == "coinbase":
                rates = res.get("data", {}).get("rates", {})
                if "USDT" in rates:
                    price = float(rates["USDT"])
                else:
                    raise ValueError("USDT rate not found in Coinbase response")

            else:
                raise ValueError("Unexpected response format")

            prices[name.lower()] = price

        except Exception as e:
            print(f"Error fetching from {name}: {e}")
    return prices

def find_arbitrage(prices):
    opportunities = []
    exchanges = list(prices.keys())
    for i in range(len(exchanges)):
        for j in range(i + 1, len(exchanges)):
            ex1, ex2 = exchanges[i], exchanges[j]
            p1, p2 = prices[ex1], prices[ex2]

            if p1 < p2:
                spread = ((p2 - p1) / p1) * 100
                opportunities.append((ex1, p1, ex2, p2, spread))
            elif p2 < p1:
                spread = ((p1 - p2) / p2) * 100
                opportunities.append((ex2, p2, ex1, p1, spread))
    return opportunities