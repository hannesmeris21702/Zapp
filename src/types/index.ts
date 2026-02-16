export interface BotConfig {
  suiRpcUrl: string;
  suiNetwork: string;
  privateKey: string;
  poolAddress: string;
  targetTokenA: string;
  targetTokenB: string;
  checkIntervalSeconds: number;
  rebalanceThreshold: number;
  targetLowerTick: number;
  targetUpperTick: number;
  minLiquidityThreshold: number;
  maxSlippage: number;
  gasBudget: number;
  dryRun: boolean;
}

export interface PositionInfo {
  positionId: string;
  liquidity: string;
  tickLower: number;
  tickUpper: number;
  tokenA: string;
  tokenB: string;
  feeA: string;
  feeB: string;
}

export interface RebalanceDecision {
  shouldRebalance: boolean;
  reason: string;
  currentTickLower?: number;
  currentTickUpper?: number;
  targetTickLower?: number;
  targetTickUpper?: number;
}
