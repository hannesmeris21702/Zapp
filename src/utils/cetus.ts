import { SuiClient } from '@mysten/sui.js/client';
import { BotConfig, PositionInfo } from '../types/index';
import Decimal from 'decimal.js';

export class CetusPoolManager {
  private client: SuiClient;
  private config: BotConfig;

  constructor(client: SuiClient, config: BotConfig) {
    this.client = client;
    this.config = config;
  }

  async getPoolInfo(): Promise<any> {
    try {
      const poolObject = await this.client.getObject({
        id: this.config.poolAddress,
        options: {
          showContent: true,
          showType: true,
        },
      });

      if (!poolObject.data) {
        throw new Error('Pool not found');
      }

      return poolObject.data;
    } catch (error) {
      throw new Error(`Failed to fetch pool info: ${error}`);
    }
  }

  async getCurrentPrice(): Promise<Decimal> {
    try {
      const poolInfo = await this.getPoolInfo();
      
      // Extract current sqrt price from pool
      // Cetus uses Uniswap V3-style pricing: price = (sqrtPrice / 2^96)^2
      if (poolInfo.content && 'fields' in poolInfo.content) {
        const fields = poolInfo.content.fields as any;
        
        // Parse sqrt_price safely - handle both string and number types
        let sqrtPriceValue = fields.current_sqrt_price;
        let sqrtPrice: Decimal;
        
        if (sqrtPriceValue === null || sqrtPriceValue === undefined) {
          sqrtPriceValue = '0';
        }
        
        try {
          sqrtPrice = new Decimal(sqrtPriceValue);
        } catch (error) {
          console.error(`⚠️  Failed to parse sqrt_price: ${sqrtPriceValue}`);
          sqrtPrice = new Decimal(0);
        }
        
        // Ensure sqrt price is a valid number
        if (sqrtPrice.isNaN()) {
          console.error(`⚠️  sqrt_price is NaN. Raw value: ${sqrtPriceValue}`);
          return new Decimal(0);
        }
        
        // Convert sqrt price to actual price using correct formula
        const price = sqrtPrice.div(new Decimal(2).pow(96)).pow(2);
        return price;
      }

      return new Decimal(0);
    } catch (error) {
      console.error('Failed to get current price:', error);
      return new Decimal(0);
    }
  }

  async getCurrentTick(): Promise<number> {
    try {
      const poolInfo = await this.getPoolInfo();
      
      if (poolInfo.content && 'fields' in poolInfo.content) {
        const fields = poolInfo.content.fields as any;
        
        // Parse tick safely - handle both string and number types
        let tick: number;
        const tickValue = fields.current_tick_index;
        
        if (typeof tickValue === 'number') {
          tick = tickValue;
        } else if (typeof tickValue === 'string') {
          tick = parseInt(tickValue, 10);
        } else {
          tick = 0;
        }
        
        // Fallback error if tick is NaN
        if (isNaN(tick)) {
          console.error(`⚠️  Current tick is NaN. Raw value: ${tickValue}`);
          throw new Error('Current tick parsed as NaN - cannot determine pool state');
        }
        
        return tick;
      }

      return 0;
    } catch (error) {
      console.error('Failed to get current tick:', error);
      throw error;
    }
  }

  async getUserPositions(walletAddress: string): Promise<PositionInfo[]> {
    try {
      // Query user's position NFTs
      const ownedObjects = await this.client.getOwnedObjects({
        owner: walletAddress,
        options: {
          showContent: true,
          showType: true,
        },
      });

      const positions: PositionInfo[] = [];
      let zeroLiquidityCount = 0;
      let otherPoolCount = 0;
      let missingPoolFieldCount = 0;

      for (const obj of ownedObjects.data) {
        if (obj.data && obj.data.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any;
          
          // Check if this is a Cetus position NFT
          if (obj.data.type?.includes('position') || obj.data.type?.includes('Position')) {
            // Filter by pool address - only include positions for the configured pool
            const positionPool = fields.pool;
            if (!positionPool) {
              // Position doesn't have a pool field - skip it
              missingPoolFieldCount++;
              continue;
            }
            if (positionPool !== this.config.poolAddress) {
              otherPoolCount++;
              continue;
            }

            // Get liquidity value - handle different types
            const liquidityRaw = fields.liquidity;
            let liquidity = '0';
            
            // Normalize liquidity to string
            if (liquidityRaw === null || liquidityRaw === undefined) {
              liquidity = '0';
            } else if (typeof liquidityRaw === 'string') {
              liquidity = liquidityRaw;
            } else if (typeof liquidityRaw === 'number') {
              liquidity = liquidityRaw.toString();
            } else if (typeof liquidityRaw === 'object' && liquidityRaw !== null) {
              // Handle BN or similar object types
              liquidity = liquidityRaw.toString();
            } else {
              liquidity = String(liquidityRaw);
            }

            // Parse ticks safely - handle both string and number types
            let tickLower: number;
            let tickUpper: number;
            
            const tickLowerValue = fields.tick_lower_index;
            const tickUpperValue = fields.tick_upper_index;
            
            if (typeof tickLowerValue === 'number') {
              tickLower = tickLowerValue;
            } else if (typeof tickLowerValue === 'string') {
              tickLower = parseInt(tickLowerValue, 10);
            } else {
              tickLower = 0;
            }
            
            if (typeof tickUpperValue === 'number') {
              tickUpper = tickUpperValue;
            } else if (typeof tickUpperValue === 'string') {
              tickUpper = parseInt(tickUpperValue, 10);
            } else {
              tickUpper = 0;
            }
            
            // Fallback error if ticks are NaN
            if (isNaN(tickLower) || isNaN(tickUpper)) {
              console.error(`⚠️  Position ${obj.data.objectId} has NaN ticks. tickLower: ${tickLowerValue}, tickUpper: ${tickUpperValue}`);
              continue;
            }
            
            // Debug logs for position details
            console.log(`\n🔍 DEBUG - Position details:`);
            console.log(`   Position ID: ${obj.data.objectId}`);
            console.log(`   Pool Address: ${positionPool}`);
            console.log(`   Liquidity (raw): ${liquidityRaw}`);
            console.log(`   Liquidity (normalized): ${liquidity}`);
            console.log(`   Lower Tick: ${tickLower}`);
            console.log(`   Upper Tick: ${tickUpper}`);
            
            // Normalize liquidity check - use BigInt for string comparison
            let hasLiquidity = false;
            try {
              // Try BigInt comparison for precise checking
              hasLiquidity = BigInt(liquidity) > BigInt(0);
            } catch (error) {
              // Fallback to Decimal if BigInt fails
              console.log(`   ℹ️  BigInt conversion failed, using Decimal fallback for liquidity: ${liquidity}`);
              hasLiquidity = new Decimal(liquidity).gt(0);
            }
            
            console.log(`   Has Liquidity: ${hasLiquidity}`);
            
            // Only include positions with non-zero liquidity
            if (hasLiquidity) {
              positions.push({
                positionId: obj.data.objectId,
                liquidity: liquidity,
                tickLower: tickLower,
                tickUpper: tickUpper,
                tokenA: fields.coin_type_a || '',
                tokenB: fields.coin_type_b || '',
                feeA: fields.fee_owed_a || '0',
                feeB: fields.fee_owed_b || '0',
              });
              console.log(`   ✅ Position included`);
            } else {
              zeroLiquidityCount++;
              console.log(`   ⚠️  Position skipped (zero liquidity)`);
            }
          }
        }
      }

      // Log filtering statistics for debugging
      if (missingPoolFieldCount > 0) {
        console.log(`\n   ℹ️  Skipped ${missingPoolFieldCount} position(s) with missing pool field`);
      }
      if (otherPoolCount > 0) {
        console.log(`   ℹ️  Filtered out ${otherPoolCount} position(s) from other pools`);
      }
      if (zeroLiquidityCount > 0) {
        console.log(`   ℹ️  Skipped ${zeroLiquidityCount} position(s) with zero liquidity`);
      }

      return positions;
    } catch (error) {
      console.error('Failed to get user positions:', error);
      return [];
    }
  }

  async collectFees(positionId: string): Promise<boolean> {
    if (this.config.dryRun) {
      console.log(`DRY RUN: Would collect fees for position ${positionId}`);
      return true;
    }

    try {
      // This would use the Cetus SDK to collect fees
      console.log(`Collecting fees for position ${positionId}`);
      // Actual implementation would call Cetus contract
      return true;
    } catch (error) {
      console.error('Failed to collect fees:', error);
      return false;
    }
  }

  async closePosition(positionId: string): Promise<boolean> {
    if (this.config.dryRun) {
      console.log(`DRY RUN: Would close position ${positionId}`);
      return true;
    }

    try {
      console.log(`Closing position ${positionId}`);
      // Actual implementation would call Cetus contract to remove liquidity
      return true;
    } catch (error) {
      console.error('Failed to close position:', error);
      return false;
    }
  }

  async openPosition(
    tickLower: number,
    tickUpper: number,
    liquidity: string
  ): Promise<string | null> {
    if (this.config.dryRun) {
      console.log(`DRY RUN: Would open position with ticks ${tickLower} to ${tickUpper}`);
      return 'dry-run-position-id';
    }

    try {
      console.log(`Opening position with ticks ${tickLower} to ${tickUpper}`);
      // Actual implementation would call Cetus contract to add liquidity
      return 'new-position-id';
    } catch (error) {
      console.error('Failed to open position:', error);
      return null;
    }
  }
}
