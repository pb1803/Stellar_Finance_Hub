import requests

def fetch_prices():
    prices = {}

    # Binance USDC/USDT
    try:
        binance = requests.get("https://api.binance.com/api/v3/ticker/price?symbol=USDCUSDT").json()
        prices["binance"] = float(binance.get("price", 0))
    except Exception as e:
        print("❌ Binance fetch failed:", e)
        prices["binance"] = None

    # CoinGecko: USDC/USD and USDT/USD
    try:
        coingecko = requests.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,tether&vs_currencies=usd"
        ).json()
        usdc_usd = coingecko.get("usd-coin", {}).get("usd")
        usdt_usd = coingecko.get("tether", {}).get("usd")
        if usdc_usd and usdt_usd:
            prices["coinbase"] = round(usdc_usd / usdt_usd, 6)
        else:
            raise ValueError("Missing USDC/USD or USDT/USD")
    except Exception as e:
        print("❌ CoinGecko fallback failed:", e)
        prices["coinbase"] = None

    return prices