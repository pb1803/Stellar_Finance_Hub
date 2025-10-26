from stellar_sdk import Server, Keypair, TransactionBuilder, Network, Asset
from dotenv import load_dotenv
import os

load_dotenv()

SENDER_SECRET = os.getenv("STELLAR_SECRET_KEY_A")
SENDER_PUBLIC = os.getenv("STELLAR_PUBLIC_KEY_A")
RECEIVER_PUBLIC = os.getenv("STELLAR_PUBLIC_KEY_B")

server = Server("https://horizon-testnet.stellar.org")
network_passphrase = Network.TESTNET_NETWORK_PASSPHRASE
ASSET = Asset.native()  # Use Asset("USDC", "GA...") if you have a testnet USDC issuer

def execute_trade(exchange, action, amount=10):
    try:
        if exchange == "binance":
            print(f"🔁 Sending {amount} {ASSET.code} from Wallet A to B on Stellar")

            sender_kp = Keypair.from_secret(SENDER_SECRET)
            sender_account = server.load_account(sender_kp.public_key)

            tx = (
                TransactionBuilder(
                    source_account=sender_account,
                    network_passphrase=network_passphrase,
                    base_fee=100
                )
                .append_payment_op(
                    destination=RECEIVER_PUBLIC,
                    amount=str(amount),
                    asset=ASSET
                )
                .set_timeout(30)
                .build()
            )

            tx.sign(sender_kp)
            response = server.submit_transaction(tx)
            print("✅ Trade executed on Stellar. Hash:", response["hash"])
            return response["hash"]

        elif exchange == "coinbase":
            print(f"(Dry-run) Would {action} {ASSET.code} on Coinbase for {amount} USDT")
            print("✅ Trade executed: simulated")
            return "SIMULATED"

    except Exception as e:
        print("❌ Trade failed:", e)
        return None