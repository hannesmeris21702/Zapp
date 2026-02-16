import * as dotenv from 'dotenv';
import { BotConfig } from '../types';

dotenv.config();

export function loadConfig(): BotConfig {
  const requiredEnvVars = [
    'SUI_RPC_URL',
    'SUI_NETWORK',
    'PRIVATE_KEY',
    'POOL_ADDRESS',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    suiRpcUrl: process.env.SUI_RPC_URL!,
    suiNetwork: process.env.SUI_NETWORK!,
    privateKey: process.env.PRIVATE_KEY!,
    poolAddress: process.env.POOL_ADDRESS!,
    targetTokenA: process.env.TARGET_TOKEN_A || 'SUI',
    targetTokenB: process.env.TARGET_TOKEN_B || 'USDC',
    checkIntervalSeconds: parseInt(process.env.CHECK_INTERVAL_SECONDS || '300'),
    rebalanceThreshold: parseFloat(process.env.REBALANCE_THRESHOLD || '0.1'),
    targetLowerTick: parseInt(process.env.TARGET_LOWER_TICK || '-10000'),
    targetUpperTick: parseInt(process.env.TARGET_UPPER_TICK || '10000'),
    minLiquidityThreshold: parseFloat(process.env.MIN_LIQUIDITY_THRESHOLD || '1000'),
    maxSlippage: parseFloat(process.env.MAX_SLIPPAGE || '0.01'),
    gasBudget: parseInt(process.env.GAS_BUDGET || '100000000'),
    dryRun: process.env.DRY_RUN === 'true',
  };
}

export function validateConfig(config: BotConfig): void {
  if (config.rebalanceThreshold < 0 || config.rebalanceThreshold > 1) {
    throw new Error('Rebalance threshold must be between 0 and 1');
  }

  if (config.maxSlippage < 0 || config.maxSlippage > 1) {
    throw new Error('Max slippage must be between 0 and 1');
  }

  if (config.targetLowerTick >= config.targetUpperTick) {
    throw new Error('Target lower tick must be less than target upper tick');
  }

  if (config.checkIntervalSeconds < 10) {
    throw new Error('Check interval must be at least 10 seconds');
  }
}
