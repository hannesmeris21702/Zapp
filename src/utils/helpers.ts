export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

export function formatTimestamp(timestamp: Date): string {
  return timestamp.toISOString();
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function calculateTickRange(currentTick: number, rangePercentage: number): [number, number] {
  const range = Math.floor(currentTick * rangePercentage);
  return [currentTick - range, currentTick + range];
}

export function isTickInRange(tick: number, lowerTick: number, upperTick: number): boolean {
  return tick >= lowerTick && tick <= upperTick;
}

export function calculatePositionDrift(
  currentLower: number,
  currentUpper: number,
  targetLower: number,
  targetUpper: number
): number {
  const currentRange = currentUpper - currentLower;
  const targetRange = targetUpper - targetLower;
  
  const lowerDiff = Math.abs(currentLower - targetLower);
  const upperDiff = Math.abs(currentUpper - targetUpper);
  
  const avgDrift = (lowerDiff + upperDiff) / 2;
  const avgRange = (currentRange + targetRange) / 2;
  
  return avgRange > 0 ? avgDrift / avgRange : 0;
}
