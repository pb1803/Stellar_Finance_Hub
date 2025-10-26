from flask import Flask, jsonify, request
from flask_cors import CORS
import math

# --- IMPORT YOUR *ACTUAL* AI LOGIC ---
from price_fetcher import fetch_prices
from arbitrage_detector import detect_arbitrage
# We will not import execute_trade to prevent real trades during simulation.

app = Flask(__name__)
CORS(app) # Allows your Node.js backend to call this

@app.route('/api/opportunities', methods=['GET'])
def get_opportunities():
    """
    This endpoint finds arbitrage opportunities using your files.
    It now includes MOCK data for a better demo.
    """
    try:
        # --- MOCK DATA FOR DEMO ---
        # Start with a list of realistic fake opportunities
        opportunities_list = [
            {
                "id": "mock_opp_1",
                "description": "Buy on Kraken at 0.9998, sell on KuCoin at 1.0012",
                "expectedProfit": (1.0012 - 0.9998) * 1000,
                "profit": (1.0012 - 0.9998) * 1000,
                "confidence": 92.0,
                "pair": "USDC/USDT",
                "buyExchange": "Kraken",
                "buyPrice": 0.9998,
                "sellExchange": "KuCoin",
                "sellPrice": 1.0012,
                "route": ["Kraken", "USDC", "KuCoin"]
            },
            {
                "id": "mock_opp_2",
                "description": "Buy on Gemini at 1.0001, sell on Crypto.com at 1.0015",
                "expectedProfit": (1.0015 - 1.0001) * 1000,
                "profit": (1.0015 - 1.0001) * 1000,
                "confidence": 88.0,
                "pair": "USDC/USDT",
                "buyExchange": "Gemini",
                "buyPrice": 1.0001,
                "sellExchange": "Crypto.com",
                "sellPrice": 1.0015,
                "route": ["Gemini", "USDC", "Crypto.com"]
            }
        ]
        # --- END MOCK DATA ---

        print("[Python AI] Fetching prices...")
        prices = fetch_prices()
        print(f"[Python AI] Prices found: {prices}")
        
        print("[Python AI] Detecting arbitrage...")
        # Pass a very low threshold to ensure a demo opportunity always shows
        demo_threshold = 0.0001 
        opportunity = detect_arbitrage(prices, threshold=demo_threshold)
        
        print(f"[Python AI] Opportunity: {opportunity}")
        
        if opportunity:
            # A *real* opportunity was found! Transform it...
            profit_per_unit = opportunity['sell_price'] - opportunity['buy_price']
            transformed_opp = {
                "id": "real_opp_1", # Give it a unique ID
                "description": f"Buy on {opportunity['buy_from']} at {opportunity['buy_price']}, sell on {opportunity['sell_on']} at {opportunity['sell_price']}",
                "expectedProfit": profit_per_unit * 1000, 
                "profit": profit_per_unit * 1000, 
                "confidence": 95.0, # Real one has high confidence
                "pair": "USDC/USDT",
                "buyExchange": opportunity['buy_from'],
                "buyPrice": opportunity['buy_price'],
                "sellExchange": opportunity['sell_on'],
                "sellPrice": opportunity['sell_price'],
                "route": [opportunity['buy_from'], "USDC", opportunity['sell_on']]
            }
            # ... and add it to the *front* of the list
            opportunities_list.insert(0, transformed_opp)

        return jsonify({
            "success": True,
            "opportunities": opportunities_list # Return the combined list
        })
        
    except Exception as e:
        print(f"Error in /api/opportunities: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
@app.route('/api/simulate', methods=['POST'])
def simulate():
    """
    This endpoint mocks a trade simulation.
    It does NOT call your execute_trade function. This is safer for the demo.
    """
    try:
        data = request.get_json()
        suggestion_id = data.get('suggestionId')
        amount = data.get('amount', 1000)
        
        print(f"[Python AI] Simulating trade for {suggestion_id} with amount {amount}")

        # --- MOCK SIMULATION RESULT ---
        # We return a fake success message because your `execute_trade`
        # is for real trades, but the frontend just wants to "simulate".
        # We'll base the mock profit on the amount.
        
        mock_estimated_profit = 2.50 * (amount / 1000) # Scale profit
        mock_net_profit = 2.10 * (amount / 1000)
        
        mock_simulation_result = {
            "estimatedProfit": mock_estimated_profit,
            "netProfit": mock_net_profit,
            "gasEstimate": 0.40, # Fake gas fee
            "message": "Trade simulated successfully."
        }

        return jsonify({
            "success": True,
            "simulation": mock_simulation_result
        })

    except Exception as e:
        print(f"Error in /api/simulate: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    print("Starting Python AI API server on http://localhost:5000")
    # We run on port 5000 to avoid conflicts
    app.run(debug=True, port=5000)