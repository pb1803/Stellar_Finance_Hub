# ai_core.py

def decide_trade(opportunity):
    ex1, p1, ex2, p2, spread = opportunity
    return f"Buy from {ex1} at {p1:.4f}, sell on {ex2} at {p2:.4f} → Spread: {spread:.2f}%"