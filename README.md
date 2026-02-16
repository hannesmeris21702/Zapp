# Cetus Liquidity Rebalance Bot

A ready-to-use automated liquidity rebalancing bot for Cetus Protocol on the Sui Network. This bot monitors your liquidity positions and automatically rebalances them when they drift from your target range.

## 🚀 Features

- **Automated Monitoring**: Continuously monitors your Cetus liquidity positions
- **Smart Rebalancing**: Automatically rebalances positions when they drift from target range
- **Fee Collection**: Collects pending fees before rebalancing
- **Configurable Strategy**: Customizable tick ranges, thresholds, and intervals
- **Dry Run Mode**: Test your configuration without executing actual transactions
- **Safety Features**: Built-in slippage protection and gas budget limits
- **Easy Setup**: Simple environment-based configuration

## 📋 Prerequisites

- Node.js 18+ installed
- A Sui wallet with funds (SUI tokens for gas)
- Your wallet's private key
- A Cetus liquidity pool address you want to monitor

## 🔧 Installation

1. Clone this repository or download the code
2. Install dependencies:

```bash
npm install
```

3. Create your configuration file:

```bash
cp .env.example .env
```

4. Edit `.env` with your settings:

```env
# Sui Network Configuration
SUI_RPC_URL=https://fullnode.mainnet.sui.io:443
SUI_NETWORK=mainnet

# Your Sui wallet private key (keep this secret!)
PRIVATE_KEY=your_private_key_here

# Cetus Pool Configuration
POOL_ADDRESS=0x... # The Cetus pool address you want to monitor

# Rebalancing Parameters
CHECK_INTERVAL_SECONDS=300  # Check every 5 minutes
REBALANCE_THRESHOLD=0.1     # Rebalance if position drifts 10% from target
TARGET_LOWER_TICK=-10000    # Target lower tick for position
TARGET_UPPER_TICK=10000     # Target upper tick for position

# Start with dry run mode enabled for testing
DRY_RUN=true
```

## 🎮 Usage

### Development Mode (with TypeScript)

```bash
npm run dev
```

### Production Mode

1. Build the project:
```bash
npm run build
```

2. Start the bot:
```bash
npm start
```

### Testing with Dry Run

Always start with `DRY_RUN=true` in your `.env` file to test your configuration without executing real transactions:

```bash
# In .env
DRY_RUN=true

# Then run the bot
npm run dev
```

The bot will simulate all operations and show you what it would do without actually executing any transactions.

### Going Live

Once you're confident with your configuration:

1. Set `DRY_RUN=false` in your `.env` file
2. Make sure you have enough SUI in your wallet for gas fees
3. Start the bot and monitor the logs

## ⚙️ Configuration Guide

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SUI_RPC_URL` | Sui network RPC endpoint | - | Yes |
| `SUI_NETWORK` | Network name (mainnet/testnet/devnet) | - | Yes |
| `PRIVATE_KEY` | Your wallet's private key (hex format) | - | Yes |
| `POOL_ADDRESS` | Cetus pool address to monitor | - | Yes |
| `TARGET_TOKEN_A` | First token symbol | SUI | No |
| `TARGET_TOKEN_B` | Second token symbol | USDC | No |
| `CHECK_INTERVAL_SECONDS` | How often to check positions | 300 | No |
| `REBALANCE_THRESHOLD` | Drift threshold to trigger rebalance | 0.1 | No |
| `TARGET_LOWER_TICK` | Target lower tick for positions | -10000 | No |
| `TARGET_UPPER_TICK` | Target upper tick for positions | 10000 | No |
| `MIN_LIQUIDITY_THRESHOLD` | Minimum liquidity value in USD | 1000 | No |
| `MAX_SLIPPAGE` | Maximum allowed slippage | 0.01 | No |
| `GAS_BUDGET` | Gas budget in MIST | 100000000 | No |
| `DRY_RUN` | Enable dry run mode | true | No |

### Understanding Ticks

Ticks represent price points in Cetus pools:
- Each tick corresponds to a specific price
- A position with ticks [-10000, 10000] provides liquidity across a price range
- The current price tick determines which positions are "in range"
- Positions out of range don't earn fees

### Rebalancing Strategy

The bot rebalances when:
1. **Position is out of range**: Current price tick is outside your position's range
2. **Position has drifted**: Position ticks differ from target by more than `REBALANCE_THRESHOLD`

Example: If `REBALANCE_THRESHOLD=0.1` (10%), the bot rebalances when your position's range drifts more than 10% from your target range.

## 🐳 Docker Support

### Build Docker Image

```bash
docker build -t cetus-rebalance-bot .
```

### Run with Docker

```bash
docker run --env-file .env cetus-rebalance-bot
```

Or with docker-compose:

```bash
docker-compose up -d
```

## 📊 Monitoring

The bot provides detailed logs:

```
🚀 Initializing Cetus Liquidity Rebalance Bot...

📋 Configuration:
   Network: mainnet
   Wallet Address: 0x123...
   Pool Address: 0xabc...
   Check Interval: 300s
   Rebalance Threshold: 10.00%
   Dry Run Mode: ✅ ENABLED

💰 Wallet Balance: 10.5 SUI

⏰ [2024-01-15T10:30:00.000Z] Running rebalance check...
📊 Current pool tick: 5000
🔍 Fetching positions...
📍 Found 1 position(s)

📌 Evaluating position: 0xpos123...
   Liquidity: 1000000
   Tick Range: [-8000, 12000]
   
✅ Position is healthy
   Position is within acceptable range
```

## 🔒 Security Best Practices

1. **Never commit your `.env` file** - It contains your private key
2. **Use a dedicated wallet** - Don't use your main wallet for bot operations
3. **Start with small amounts** - Test with minimal liquidity first
4. **Monitor regularly** - Keep an eye on bot operations
5. **Set reasonable gas budgets** - Prevent excessive gas spending
6. **Use testnet first** - Test on Sui testnet before mainnet

## 🛠️ Troubleshooting

### Bot can't connect to pool
- Verify `POOL_ADDRESS` is correct
- Check `SUI_RPC_URL` is accessible
- Ensure your network connection is stable

### No positions found
- Make sure you have liquidity positions in the specified pool
- Verify your `PRIVATE_KEY` corresponds to the correct wallet
- Check if positions are in the correct pool address

### Transaction failures
- Ensure sufficient SUI balance for gas
- Check `GAS_BUDGET` is adequate
- Verify pool liquidity and market conditions

### Position not rebalancing
- Check if drift exceeds `REBALANCE_THRESHOLD`
- Verify `TARGET_LOWER_TICK` and `TARGET_UPPER_TICK` are set correctly
- Review logs for decision reasoning

## 📚 How It Works

1. **Initialization**: Bot connects to Sui network and validates configuration
2. **Position Monitoring**: Periodically queries your liquidity positions
3. **Evaluation**: Calculates if positions need rebalancing based on:
   - Current price tick vs position range
   - Position drift from target range
4. **Rebalancing**: If needed:
   - Collects pending fees
   - Closes old position
   - Opens new position at target range

## 🔄 Update Strategy

To change your rebalancing strategy:

1. Stop the bot (Ctrl+C)
2. Update parameters in `.env`
3. Test with `DRY_RUN=true`
4. Deploy with `DRY_RUN=false`

## ⚠️ Disclaimer

This bot is provided as-is. Use at your own risk. Always:
- Test thoroughly with dry run mode
- Start with small amounts
- Monitor bot operations
- Understand the risks of automated trading
- Be aware of market volatility and impermanent loss

## 📝 License

MIT License - feel free to modify and use for your needs.

## 🤝 Support

For issues, questions, or contributions, please open an issue on the repository.

## 🎯 Roadmap

Future enhancements:
- [ ] Multiple position management
- [ ] Advanced rebalancing strategies
- [ ] Web dashboard for monitoring
- [ ] Telegram/Discord notifications
- [ ] Historical performance tracking
- [ ] Multi-pool support
- [ ] Dynamic tick range optimization

---

**Happy Rebalancing! 🚀**
