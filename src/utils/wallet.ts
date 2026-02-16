import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { BotConfig } from '../types';

export class SuiWalletManager {
  private keypair: Ed25519Keypair;
  private client: SuiClient;
  private config: BotConfig;

  constructor(config: BotConfig) {
    this.config = config;
    this.client = new SuiClient({ url: config.suiRpcUrl });
    
    try {
      // Parse private key - support both hex and base64
      const privateKey = config.privateKey.replace('0x', '');
      const privateKeyBytes = Buffer.from(privateKey, 'hex');
      this.keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
    } catch (error) {
      throw new Error(`Failed to initialize wallet: ${error}`);
    }
  }

  getAddress(): string {
    return this.keypair.getPublicKey().toSuiAddress();
  }

  getClient(): SuiClient {
    return this.client;
  }

  getKeypair(): Ed25519Keypair {
    return this.keypair;
  }

  async getBalance(coinType?: string): Promise<bigint> {
    const address = this.getAddress();
    const balance = await this.client.getBalance({
      owner: address,
      coinType: coinType || '0x2::sui::SUI',
    });
    return BigInt(balance.totalBalance);
  }

  async executeTransaction(txBlock: TransactionBlock): Promise<string> {
    if (this.config.dryRun) {
      console.log('DRY RUN: Would execute transaction');
      console.log('Transaction details:', JSON.stringify(txBlock, null, 2));
      return 'dry-run-tx-hash';
    }

    try {
      const result = await this.client.signAndExecuteTransactionBlock({
        transactionBlock: txBlock,
        signer: this.keypair,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      return result.digest;
    } catch (error) {
      throw new Error(`Transaction execution failed: ${error}`);
    }
  }
}
