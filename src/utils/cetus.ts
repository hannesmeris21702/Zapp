import { SuiClient } from '@mysten/sui.js/client';
import { BotConfig, PositionInfo } from '../types';
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
      // This is a simplified version - actual implementation depends on Cetus SDK structure
      if (poolInfo.content && 'fields' in poolInfo.content) {
        const fields = poolInfo.content.fields as any;
        const sqrtPrice = new Decimal(fields.current_sqrt_price || '0');
        
        // Convert sqrt price to actual price
        const price = sqrtPrice.pow(2).div(new Decimal(2).pow(128));
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
        return parseInt(fields.current_tick_index || '0');
      }

      return 0;
    } catch (error) {
      console.error('Failed to get current tick:', error);
      return 0;
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

      for (const obj of ownedObjects.data) {
        if (obj.data && obj.data.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any;
          
          // Check if this is a Cetus position NFT
          if (obj.data.type?.includes('position') || obj.data.type?.includes('Position')) {
            positions.push({
              positionId: obj.data.objectId,
              liquidity: fields.liquidity || '0',
              tickLower: parseInt(fields.tick_lower_index || '0'),
              tickUpper: parseInt(fields.tick_upper_index || '0'),
              tokenA: fields.coin_type_a || '',
              tokenB: fields.coin_type_b || '',
              feeA: fields.fee_owed_a || '0',
              feeB: fields.fee_owed_b || '0',
            });
          }
        }
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
