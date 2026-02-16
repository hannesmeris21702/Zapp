# Cetus Liquidity Rebalance Bot - Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Your Bot

1. Copy the example configuration:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your details:
```env
SUI_RPC_URL=https://fullnode.mainnet.sui.io:443
SUI_NETWORK=mainnet
PRIVATE_KEY=your_private_key_in_hex_format
POOL_ADDRESS=0x_your_cetus_pool_address
DRY_RUN=true  # Keep this true for testing!
```

### How to Get Your Private Key

**From Sui Wallet:**
1. Open your Sui wallet
2. Go to Settings → Export Private Key
3. Copy the private key (it should be a hex string)
4. Paste it in the `.env` file

### How to Find Pool Address

1. Go to Cetus app: https://app.cetus.zone/
2. Navigate to the pool you want to manage
3. Copy the pool address from the URL or pool details
4. Paste it in the `.env` file

## Step 3: Test with Dry Run

```bash
npm run dev
```

You should see output like:
```
🚀 Initializing Cetus Liquidity Rebalance Bot...
📋 Configuration:
   Dry Run Mode: ✅ ENABLED
...
```

The bot will show what it would do without executing real transactions.

## Step 4: Configure Your Strategy

Edit these values in `.env` to match your strategy:

```env
# Check positions every 5 minutes
CHECK_INTERVAL_SECONDS=300

# Rebalance if position drifts 10% from target
REBALANCE_THRESHOLD=0.1

# Target tick range (adjust based on your pool and strategy)
TARGET_LOWER_TICK=-10000
TARGET_UPPER_TICK=10000
```

## Step 5: Go Live (Optional)

Once you're happy with the dry run:

1. Set `DRY_RUN=false` in `.env`
2. Make sure you have enough SUI for gas (~1 SUI recommended)
3. Run the bot:
```bash
npm run build
npm start
```

## Understanding the Output

### Position is Healthy
```
✅ Position is healthy
   Position is within acceptable range
```
→ No action needed

### Position Needs Rebalancing
```
🎯 Rebalance Decision: YES
   Reason: Position has drifted 15.5% from target range
   [DRY RUN] Would execute rebalance
```
→ Bot will rebalance (or show what it would do in dry run mode)

## Tips for Beginners

1. **Start with Dry Run**: Always test with `DRY_RUN=true` first
2. **Use Testnet**: Consider testing on Sui testnet before mainnet
3. **Small Amounts**: Start with a small liquidity position
4. **Monitor Initially**: Watch the bot for a few hours when first deploying
5. **Adjust Parameters**: Fine-tune tick ranges based on your pool's behavior

## Common Settings

### Conservative Strategy (Wide Range)
```env
REBALANCE_THRESHOLD=0.2
TARGET_LOWER_TICK=-20000
TARGET_UPPER_TICK=20000
```
→ Less frequent rebalancing, more forgiving

### Aggressive Strategy (Narrow Range)
```env
REBALANCE_THRESHOLD=0.05
TARGET_LOWER_TICK=-5000
TARGET_UPPER_TICK=5000
```
→ More frequent rebalancing, concentrated liquidity

## Need Help?

1. Check the full README.md for detailed documentation
2. Verify your configuration in `.env`
3. Review logs for error messages
4. Ensure sufficient SUI balance for gas

## Safety Checklist

- [ ] Using dry run mode for initial testing
- [ ] Private key is secure and not committed to git
- [ ] Using a dedicated wallet (not your main wallet)
- [ ] Sufficient SUI balance for gas
- [ ] Tested on testnet or with small amounts
- [ ] Monitoring bot operations regularly

Happy rebalancing! 🚀
