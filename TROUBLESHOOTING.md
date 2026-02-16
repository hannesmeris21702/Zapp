# Troubleshooting Guide

This guide helps you resolve common issues when running the Cetus Liquidity Rebalance Bot.

## Installation Issues

### "Cannot find module" errors during build

**Error**:
```
Cannot find module '../types' or its corresponding type declarations
```

**Solution**:
1. Ensure all dependencies are installed: `npm install`
2. Clean and rebuild: `npm run clean && npm run build`
3. Check that all TypeScript files are in the correct directories

### "Node.js version too old" error

**Error**:
```
Error: Node.js 18 or higher is required
```

**Solution**:
1. Install Node.js 18+ from https://nodejs.org/
2. Verify version: `node -v`
3. Restart your terminal after installation

### npm install fails with network errors

**Error**:
```
npm ERR! network request to https://registry.npmjs.org/...
```

**Solution**:
1. Check your internet connection
2. Try clearing npm cache: `npm cache clean --force`
3. Try with different npm registry: `npm config set registry https://registry.npmjs.org/`

---

## Configuration Issues

### "Missing required environment variable" error

**Error**:
```
Error: Missing required environment variable: SUI_RPC_URL
```

**Solution**:
1. Ensure `.env` file exists in the project root
2. Copy from template if needed: `cp .env.example .env`
3. Fill in all required variables (SUI_RPC_URL, PRIVATE_KEY, POOL_ADDRESS)

### "Rebalance threshold must be between 0 and 1" error

**Error**:
```
Error: Rebalance threshold must be between 0 and 1
```

**Solution**:
Set `REBALANCE_THRESHOLD` as a decimal (e.g., `0.1` for 10%), not a percentage.

### "Target lower tick must be less than target upper tick" error

**Error**:
```
Error: Target lower tick must be less than target upper tick
```

**Solution**:
Verify in `.env`:
```env
TARGET_LOWER_TICK=-10000  # Must be negative or lower value
TARGET_UPPER_TICK=10000   # Must be positive or higher value
```

---

## Connection Issues

### "Failed to initialize wallet" error

**Error**:
```
Failed to initialize wallet: Error: ...
```

**Possible Causes & Solutions**:

1. **Invalid Private Key Format**
   - Ensure private key is in hex format (64 characters)
   - Remove any `0x` prefix if present in the key itself
   - Check for extra spaces or newlines

2. **Wrong Key Length**
   - Private key should be exactly 64 hex characters
   - Example: `a1b2c3d4...` (64 chars total)

### "fetch failed" or "ENOTFOUND" errors

**Error**:
```
TypeError: fetch failed
Error: getaddrinfo ENOTFOUND fullnode.mainnet.sui.io
```

**Possible Causes & Solutions**:

1. **Network/Firewall Issues**
   - Check internet connection
   - Verify firewall isn't blocking outbound connections
   - Try from a different network

2. **RPC Endpoint Down**
   - Try alternative RPC endpoints:
     ```env
     # Mainnet alternatives
     SUI_RPC_URL=https://sui-mainnet.nodeinfra.com
     SUI_RPC_URL=https://sui-mainnet-endpoint.blockvision.org
     
     # Testnet
     SUI_RPC_URL=https://fullnode.testnet.sui.io:443
     ```

3. **Rate Limiting**
   - Public RPC endpoints may have rate limits
   - Consider using a private RPC endpoint
   - Increase `CHECK_INTERVAL_SECONDS` to reduce request frequency

### "Could not fetch pool info" error

**Error**:
```
Error: Could not connect to pool: Error: Failed to fetch pool info
```

**Solutions**:
1. Verify `POOL_ADDRESS` is correct
2. Ensure pool exists on the specified network (mainnet/testnet)
3. Check if you have the correct pool address from Cetus app
4. Verify RPC endpoint is working

---

## Position Issues

### "No positions found for this wallet"

**Possible Causes & Solutions**:

1. **Wrong Wallet**
   - Verify `PRIVATE_KEY` corresponds to wallet with positions
   - Check wallet address in logs matches expected address

2. **Wrong Network**
   - Ensure `SUI_NETWORK` matches where positions exist
   - Positions on mainnet won't show on testnet

3. **No Active Positions**
   - Verify you have liquidity positions in the specified pool
   - Check Cetus app to confirm positions

### Position not rebalancing when expected

**Possible Causes & Solutions**:

1. **Dry Run Mode Enabled**
   - Check `.env`: Set `DRY_RUN=false` for actual transactions
   - Bot will only simulate in dry run mode

2. **Threshold Not Met**
   - Check logs for decision reasoning
   - Current drift might be below `REBALANCE_THRESHOLD`
   - Consider lowering threshold if you want more frequent rebalancing

3. **Position Still In Range**
   - Position might still be earning fees
   - Bot only rebalances when necessary
   - Review target tick range vs current tick in logs

---

## Transaction Issues

### "Transaction execution failed" errors

**Possible Causes & Solutions**:

1. **Insufficient Gas**
   - Ensure wallet has enough SUI for gas
   - Recommended: Keep at least 2-5 SUI in wallet
   - Check balance: Bot logs show balance at startup

2. **Gas Budget Too Low**
   - Increase `GAS_BUDGET` in `.env`
   - Default is 500000000 MIST (0.5 SUI)
   - Try: `GAS_BUDGET=1000000000` (1 SUI)

3. **Slippage Too Low**
   - Market moved during transaction
   - Increase `MAX_SLIPPAGE` slightly (e.g., from 0.01 to 0.02)
   - Be cautious with high slippage in volatile markets

4. **Pool Liquidity Issues**
   - Pool might have insufficient liquidity
   - Try during periods of higher liquidity
   - Consider using a more liquid pool

### Transactions pending/stuck

**Solutions**:
1. Check transaction on Sui explorer: https://suiscan.xyz/mainnet/home
2. Verify RPC endpoint is responsive
3. Restart bot if necessary
4. Check network status: https://status.sui.io/

---

## Docker Issues

### Docker build fails

**Error**:
```
ERROR [build 5/7] RUN npm run build
```

**Solution**:
1. Ensure Dockerfile is using updated version (installs all deps before build)
2. Try building locally first: `npm run build`
3. Check Docker has enough disk space
4. Clear Docker cache: `docker system prune`

### Container exits immediately

**Solution**:
1. Check logs: `docker logs cetus-rebalance-bot`
2. Verify `.env` file exists and has correct values
3. Ensure `env_file` is set in docker-compose.yml
4. Check for configuration errors in logs

### Cannot connect to RPC from Docker

**Solution**:
1. Ensure Docker has network access
2. Try using IP address instead of hostname
3. Check firewall rules for Docker
4. Test RPC endpoint from host machine first

---

## Performance Issues

### High gas costs

**Causes & Solutions**:

1. **Too Frequent Rebalancing**
   - Increase `CHECK_INTERVAL_SECONDS` (e.g., from 300 to 900)
   - Increase `REBALANCE_THRESHOLD` (e.g., from 0.1 to 0.2)
   - Widen tick range for more stable positions

2. **Volatile Market**
   - Consider pausing bot during high volatility
   - Use wider tick ranges
   - Accept lower fee earnings for stability

### Bot using too much CPU/memory

**Solutions**:
1. Increase `CHECK_INTERVAL_SECONDS` to reduce polling
2. Restart bot periodically (e.g., daily)
3. Monitor with: `docker stats cetus-rebalance-bot`
4. Check for memory leaks in logs

---

## Verification & Testing

### How to verify bot is working correctly

1. **Check Logs Regularly**
   ```bash
   # View live logs
   tail -f path/to/logs
   
   # With Docker
   docker logs -f cetus-rebalance-bot
   ```

2. **Test with Dry Run First**
   ```env
   DRY_RUN=true
   ```
   - Run for 24-48 hours
   - Verify decisions make sense
   - Check if it would rebalance appropriately

3. **Monitor First Rebalance**
   - Watch logs closely during first rebalance
   - Verify transaction on explorer
   - Check new position in Cetus app

4. **Check Position Health**
   - Compare bot decisions with manual analysis
   - Verify positions stay in optimal range
   - Monitor fee earnings

### How to test before going live

1. **Use Testnet First**
   ```env
   SUI_RPC_URL=https://fullnode.testnet.sui.io:443
   SUI_NETWORK=testnet
   ```

2. **Start with Small Position**
   - Use minimal liquidity for first test
   - Verify behavior before scaling up

3. **Verify All Components**
   - [ ] Bot starts without errors
   - [ ] Positions are detected correctly
   - [ ] Decisions are logged clearly
   - [ ] Dry run mode works
   - [ ] Rebalancing logic is sound

---

## Getting Additional Help

### Information to Provide When Asking for Help

1. **Environment**
   - Node.js version: `node -v`
   - npm version: `npm -v`
   - Operating system
   - Docker version (if applicable)

2. **Configuration** (sanitized)
   - Network (mainnet/testnet)
   - Check interval
   - Rebalance threshold
   - Dry run status

3. **Error Details**
   - Full error message from logs
   - Steps to reproduce
   - When the error occurs

4. **Logs**
   - Last 50-100 lines before error
   - Timestamp of issue
   - Any relevant transaction hashes

### Resources

- **Sui Documentation**: https://docs.sui.io/
- **Cetus Documentation**: https://cetus-1.gitbook.io/cetus-docs
- **Sui Explorer**: https://suiscan.xyz/
- **Sui Status**: https://status.sui.io/
- **Sui Discord**: https://discord.com/invite/sui

---

## Emergency Procedures

### How to stop the bot immediately

**Local/Development**:
```bash
# Press Ctrl+C in the terminal running the bot
```

**Docker**:
```bash
docker-compose down
# or
docker stop cetus-rebalance-bot
```

### How to manually close positions

If bot encounters issues and you need to manually intervene:

1. Go to Cetus app: https://app.cetus.zone/
2. Connect your wallet
3. Navigate to "Liquidity" → "My Positions"
4. Manually close or adjust positions as needed

### Data Backup

The bot doesn't store state, but you should keep:
- Backup of `.env` configuration (without private key exposed)
- Record of your positions and addresses
- Backup of private key in secure location

---

## Prevention Tips

1. **Always Test First**
   - Use dry run mode extensively
   - Test on testnet before mainnet
   - Start with small amounts

2. **Monitor Regularly**
   - Check logs daily (at least initially)
   - Set up alerts if possible
   - Keep Cetus app open to verify positions

3. **Maintain Sufficient Balance**
   - Keep 2-5 SUI minimum for gas
   - Monitor balance regularly
   - Set up low balance alerts if possible

4. **Stay Updated**
   - Check for bot updates
   - Monitor Sui network status
   - Stay informed about Cetus protocol changes

5. **Secure Your Credentials**
   - Never commit `.env` to git
   - Use dedicated wallet for bot
   - Limit wallet balance to what's needed

---

For more information, see [README.md](README.md) and [QUICKSTART.md](QUICKSTART.md).
