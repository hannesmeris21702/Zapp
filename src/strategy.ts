import { BotConfig, PositionInfo, RebalanceDecision } from './types';
import { CetusPoolManager } from './utils/cetus';
import { calculatePositionDrift } from './utils/helpers';

export class RebalanceStrategy {
  private config: BotConfig;
  private poolManager: CetusPoolManager;

  constructor(config: BotConfig, poolManager: CetusPoolManager) {
    this.config = config;
    this.poolManager = poolManager;
  }

  async evaluateRebalance(position: PositionInfo): Promise<RebalanceDecision> {
    const currentTick = await this.poolManager.getCurrentTick();
    
    // Check if position is out of range
    const isInRange = currentTick >= position.tickLower && currentTick <= position.tickUpper;
    
    if (!isInRange) {
      return {
        shouldRebalance: true,
        reason: `Position is out of range. Current tick: ${currentTick}, Position range: [${position.tickLower}, ${position.tickUpper}]`,
        currentTickLower: position.tickLower,
        currentTickUpper: position.tickUpper,
        targetTickLower: this.config.targetLowerTick,
        targetTickUpper: this.config.targetUpperTick,
      };
    }

    // Calculate drift from target range
    const drift = calculatePositionDrift(
      position.tickLower,
      position.tickUpper,
      this.config.targetLowerTick,
      this.config.targetUpperTick
    );

    if (drift > this.config.rebalanceThreshold) {
      return {
        shouldRebalance: true,
        reason: `Position has drifted ${(drift * 100).toFixed(2)}% from target range (threshold: ${(this.config.rebalanceThreshold * 100).toFixed(2)}%)`,
        currentTickLower: position.tickLower,
        currentTickUpper: position.tickUpper,
        targetTickLower: this.config.targetLowerTick,
        targetTickUpper: this.config.targetUpperTick,
      };
    }

    return {
      shouldRebalance: false,
      reason: 'Position is within acceptable range',
    };
  }

  async executeRebalance(position: PositionInfo): Promise<boolean> {
    try {
      console.log(`\n🔄 Starting rebalance for position ${position.positionId}`);

      // Step 1: Collect any pending fees
      console.log('📊 Collecting pending fees...');
      const feesCollected = await this.poolManager.collectFees(position.positionId);
      if (!feesCollected) {
        console.error('❌ Failed to collect fees');
        return false;
      }

      // Step 2: Close the existing position
      console.log('🔒 Closing existing position...');
      const positionClosed = await this.poolManager.closePosition(position.positionId);
      if (!positionClosed) {
        console.error('❌ Failed to close position');
        return false;
      }

      // Step 3: Open a new position with target ticks
      console.log(`🆕 Opening new position with ticks [${this.config.targetLowerTick}, ${this.config.targetUpperTick}]...`);
      const newPositionId = await this.poolManager.openPosition(
        this.config.targetLowerTick,
        this.config.targetUpperTick,
        position.liquidity
      );

      if (!newPositionId) {
        console.error('❌ Failed to open new position');
        return false;
      }

      console.log(`✅ Rebalance completed! New position ID: ${newPositionId}`);
      return true;
    } catch (error) {
      console.error(`❌ Rebalance failed:`, error);
      return false;
    }
  }
}
