# Example Scenarios

This document shows common usage scenarios and configuration examples for the Cetus Liquidity Rebalance Bot.

## Scenario 1: Conservative SUI-USDC Pool

**Use Case**: Provide liquidity to SUI-USDC pool with a wide range, rebalancing infrequently.

**Configuration** (.env):
```env
SUI_RPC_URL=https://fullnode.mainnet.sui.io:443
SUI_NETWORK=mainnet
PRIVATE_KEY=your_private_key_here
POOL_ADDRESS=0x... # SUI-USDC pool address

# Check every 30 minutes
CHECK_INTERVAL_SECONDS=1800

# Only rebalance if position drifts 20% from target
REBALANCE_THRESHOLD=0.2

# Wide tick range for more stable position
TARGET_LOWER_TICK=-30000
TARGET_UPPER_TICK=30000

DRY_RUN=true
```

**Expected Behavior**:
- Bot checks position every 30 minutes
- Only rebalances if price moves significantly
- Lower gas costs due to infrequent rebalancing
- More resilient to price volatility

---

## Scenario 2: Aggressive High-Yield Strategy

**Use Case**: Maximize fee earnings with concentrated liquidity, accepting more frequent rebalancing.

**Configuration** (.env):
```env
SUI_RPC_URL=https://fullnode.mainnet.sui.io:443
SUI_NETWORK=mainnet
PRIVATE_KEY=your_private_key_here
POOL_ADDRESS=0x... # Your pool address

# Check every 5 minutes for quick response
CHECK_INTERVAL_SECONDS=300

# Rebalance on 5% drift for tight range maintenance
REBALANCE_THRESHOLD=0.05

# Narrow tick range for concentrated liquidity
TARGET_LOWER_TICK=-5000
TARGET_UPPER_TICK=5000

DRY_RUN=true
```

**Expected Behavior**:
- Bot checks position every 5 minutes
- Rebalances frequently to maintain concentrated liquidity
- Higher fee earnings when in range
- Higher gas costs due to frequent rebalancing

---

## Scenario 3: Testnet Development

**Use Case**: Test the bot on Sui testnet before deploying to mainnet.

**Configuration** (.env):
```env
# Use testnet RPC
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_NETWORK=testnet

# Testnet wallet private key
PRIVATE_KEY=your_testnet_private_key_here
POOL_ADDRESS=0x... # Testnet pool address

# Frequent checks for testing
CHECK_INTERVAL_SECONDS=60

# Standard parameters
REBALANCE_THRESHOLD=0.1
TARGET_LOWER_TICK=-10000
TARGET_UPPER_TICK=10000

# Keep dry run enabled for initial testing
DRY_RUN=true
```

**Testing Process**:
1. Get testnet SUI from faucet: https://discord.com/invite/sui
2. Create or find a testnet Cetus pool
3. Add liquidity manually
4. Run bot with `DRY_RUN=true`
5. Verify bot correctly identifies positions
6. Set `DRY_RUN=false` to test actual rebalancing
7. Monitor transactions on Sui testnet explorer

---

## Scenario 4: Multiple Check Intervals

**Use Case**: Different strategies for different market conditions.

### During Volatile Markets (volatile.env):
```env
# Fast response to price movements
CHECK_INTERVAL_SECONDS=180
REBALANCE_THRESHOLD=0.08
TARGET_LOWER_TICK=-8000
TARGET_UPPER_TICK=8000
```

### During Stable Markets (stable.env):
```env
# Relaxed checks to save on gas
CHECK_INTERVAL_SECONDS=3600
REBALANCE_THRESHOLD=0.15
TARGET_LOWER_TICK=-15000
TARGET_UPPER_TICK=15000
```

**Usage**:
```bash
# Use volatile configuration
cp volatile.env .env
npm start

# Later, switch to stable configuration
cp stable.env .env
# Restart the bot
```

---

## Scenario 5: Production Deployment with Docker

**Use Case**: Deploy bot on a server with automatic restarts.

**docker-compose.yml** (already included):
```yaml
version: '3.8'

services:
  cetus-bot:
    build: .
    container_name: cetus-rebalance-bot
    restart: unless-stopped
    env_file:
      - .env
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Deployment Steps**:
```bash
# 1. Configure production settings
cp .env.example .env
# Edit .env with production values
# Set DRY_RUN=false

# 2. Build and start with Docker
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Stop bot
docker-compose down
```

---

## Common Configuration Patterns

### Gas Optimization
```env
# Reduce gas costs with less frequent checks
CHECK_INTERVAL_SECONDS=3600
REBALANCE_THRESHOLD=0.2
GAS_BUDGET=300000000  # 0.3 SUI
```

### Maximum Responsiveness
```env
# React quickly to market changes
CHECK_INTERVAL_SECONDS=120
REBALANCE_THRESHOLD=0.05
GAS_BUDGET=700000000  # 0.7 SUI
```

### Balanced Approach
```env
# Default recommended settings
CHECK_INTERVAL_SECONDS=300
REBALANCE_THRESHOLD=0.1
TARGET_LOWER_TICK=-10000
TARGET_UPPER_TICK=10000
GAS_BUDGET=500000000  # 0.5 SUI
```

---

## Monitoring Tips

### Check Bot Status
```bash
# View real-time logs
tail -f logs/bot.log  # If you set up logging

# With Docker
docker logs -f cetus-rebalance-bot
```

### Expected Log Patterns

**Healthy Position**:
```
⏰ [2024-01-15T10:30:00.000Z] Running rebalance check...
📊 Current pool tick: 5000
🔍 Fetching positions...
📍 Found 1 position(s)
✅ Position is healthy
   Position is within acceptable range
```

**Rebalancing Needed**:
```
⏰ [2024-01-15T11:00:00.000Z] Running rebalance check...
📊 Current pool tick: 15000
🎯 Rebalance Decision: YES
   Reason: Position is out of range...
🔄 Starting rebalance for position...
✅ Rebalance completed!
```

---

## Safety Checklist Before Going Live

- [ ] Tested with `DRY_RUN=true` for at least 24 hours
- [ ] Verified wallet has sufficient SUI for gas (recommend 2-5 SUI)
- [ ] Confirmed pool address is correct
- [ ] Private key is secure and not exposed
- [ ] Understand tick ranges for your chosen pool
- [ ] Set appropriate `REBALANCE_THRESHOLD` for your risk tolerance
- [ ] Configured reasonable `CHECK_INTERVAL_SECONDS`
- [ ] Tested on testnet first (recommended)
- [ ] Have monitoring in place (logs, alerts)
- [ ] Understand impermanent loss implications

---

## Troubleshooting Common Issues

### Bot Not Rebalancing
**Check**: Is `DRY_RUN=true`? Set to `false` for actual transactions.
**Check**: Is position drift above `REBALANCE_THRESHOLD`?
**Solution**: Review logs for decision reasoning.

### High Gas Costs
**Solution**: Increase `CHECK_INTERVAL_SECONDS` and `REBALANCE_THRESHOLD`.

### Frequent Rebalancing
**Solution**: Widen tick range (`TARGET_LOWER_TICK`, `TARGET_UPPER_TICK`).
**Solution**: Increase `REBALANCE_THRESHOLD`.

### Connection Errors
**Check**: Is `SUI_RPC_URL` accessible?
**Solution**: Try alternative RPC endpoints.

---

For more details, see the main [README.md](README.md) and [QUICKSTART.md](QUICKSTART.md).
