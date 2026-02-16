import { loadConfig, validateConfig } from './config';
import { SuiWalletManager } from './utils/wallet';
import { CetusPoolManager } from './utils/cetus';
import { RebalanceStrategy } from './strategy';
import { sleep, formatTimestamp } from './utils/helpers';
import Decimal from 'decimal.js';

class CetusRebalanceBot {
  private config;
  private walletManager: SuiWalletManager;
  private poolManager: CetusPoolManager;
  private strategy: RebalanceStrategy;
  private isRunning: boolean = false;

  constructor() {
    this.config = loadConfig();
    validateConfig(this.config);
    
    this.walletManager = new SuiWalletManager(this.config);
    this.poolManager = new CetusPoolManager(
      this.walletManager.getClient(),
      this.config
    );
    this.strategy = new RebalanceStrategy(this.config, this.poolManager);
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Cetus Liquidity Rebalance Bot...\n');
    
    console.log('📋 Configuration:');
    console.log(`   Network: ${this.config.suiNetwork}`);
    console.log(`   RPC URL: ${this.config.suiRpcUrl}`);
    console.log(`   Wallet Address: ${this.walletManager.getAddress()}`);
    console.log(`   Pool Address: ${this.config.poolAddress}`);
    console.log(`   Check Interval: ${this.config.checkIntervalSeconds}s`);
    console.log(`   Rebalance Threshold: ${(this.config.rebalanceThreshold * 100).toFixed(2)}%`);
    console.log(`   Target Tick Range: [${this.config.targetLowerTick}, ${this.config.targetUpperTick}]`);
    console.log(`   Dry Run Mode: ${this.config.dryRun ? '✅ ENABLED' : '❌ DISABLED'}\n`);

    // Check wallet balance
    try {
      const balance = await this.walletManager.getBalance();
      console.log(`💰 Wallet Balance: ${Number(balance) / 1e9} SUI\n`);
    } catch (error) {
      console.error('⚠️  Warning: Could not fetch wallet balance:', error);
    }

    // Check pool info
    try {
      const poolInfo = await this.poolManager.getPoolInfo();
      console.log('✅ Pool connection successful');
      console.log(`   Pool Type: ${poolInfo.type || 'Unknown'}\n`);
    } catch (error) {
      console.error('❌ Error: Could not connect to pool:', error);
      throw error;
    }
  }

  async checkAndRebalance(): Promise<void> {
    try {
      const timestamp = formatTimestamp(new Date());
      console.log(`\n⏰ [${timestamp}] Running rebalance check...`);

      // Get wallet address
      const walletAddress = this.walletManager.getAddress();

      // Get current tick
      const currentTick = await this.poolManager.getCurrentTick();
      console.log(`📊 Current pool tick: ${currentTick}`);

      // Get user positions
      console.log(`🔍 Fetching positions for wallet ${walletAddress}...`);
      const positions = await this.poolManager.getUserPositions(walletAddress);

      if (positions.length === 0) {
        console.log('⚠️  No positions found for this wallet');
        return;
      }

      console.log(`📍 Found ${positions.length} position(s)\n`);

      // Check each position
      for (const position of positions) {
        console.log(`\n📌 Evaluating position: ${position.positionId}`);
        console.log(`   Liquidity: ${position.liquidity}`);
        console.log(`   Tick Range: [${position.tickLower}, ${position.tickUpper}]`);
        console.log(`   Fees: ${position.feeA} / ${position.feeB}`);

        // Skip positions with zero liquidity
        if (new Decimal(position.liquidity).lte(0)) {
          console.log(`\n⚠️  Skipping position with zero liquidity`);
          continue;
        }

        // Evaluate if rebalance is needed
        const decision = await this.strategy.evaluateRebalance(position);

        if (decision.shouldRebalance) {
          console.log(`\n🎯 Rebalance Decision: YES`);
          console.log(`   Reason: ${decision.reason}`);

          if (this.config.dryRun) {
            console.log('   [DRY RUN] Would execute rebalance');
          } else {
            console.log('   Executing rebalance...');
            const success = await this.strategy.executeRebalance(position);
            if (success) {
              console.log('   ✅ Rebalance completed successfully');
            } else {
              console.log('   ❌ Rebalance failed');
            }
          }
        } else {
          console.log(`\n✅ Position is healthy`);
          console.log(`   ${decision.reason}`);
        }
      }
    } catch (error) {
      console.error('❌ Error during rebalance check:', error);
    }
  }

  async start(): Promise<void> {
    await this.initialize();

    this.isRunning = true;
    console.log('🤖 Bot started! Running checks every', this.config.checkIntervalSeconds, 'seconds...');
    console.log('Press Ctrl+C to stop\n');

    // Run first check immediately
    await this.checkAndRebalance();

    // Then run on interval
    while (this.isRunning) {
      await sleep(this.config.checkIntervalSeconds * 1000);
      if (this.isRunning) {
        await this.checkAndRebalance();
      }
    }
  }

  stop(): void {
    console.log('\n🛑 Stopping bot...');
    this.isRunning = false;
  }
}

// Main execution
async function main() {
  const bot = new CetusRebalanceBot();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n📡 Received SIGINT signal');
    bot.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n📡 Received SIGTERM signal');
    bot.stop();
    process.exit(0);
  });

  try {
    await bot.start();
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the bot
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { CetusRebalanceBot };
