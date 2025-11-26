import { GameHistoryEntry } from '../types';
import { config } from '../config';

/**
 * Game State Model
 * Manages balance and history with thread-safe operations
 */
export class GameState {
  private balance: number;
  private history: GameHistoryEntry[] = [];
  private lock: Promise<void> = Promise.resolve();

  constructor(initialBalance: number = config.initialBalance) {
    this.balance = initialBalance;
  }

  /**
   * Execute operation with lock to prevent race conditions
   */
  private async withLock<T>(operation: () => T | Promise<T>): Promise<T> {
    const previousLock = this.lock;
    let releaseLock: () => void;
    this.lock = new Promise<void>(resolve => { releaseLock = resolve; });
    
    await previousLock;
    try {
      return await operation();
    } finally {
      releaseLock!();
    }
  }

  async getBalance(): Promise<number> {
    return this.balance;
  }

  async setBalance(amount: number): Promise<void> {
    await this.withLock(() => {
      this.balance = amount;
    });
  }

  async addToBalance(amount: number): Promise<void> {
    await this.withLock(() => {
      this.balance += amount;
    });
  }

  async subtractFromBalance(amount: number): Promise<void> {
    await this.withLock(() => {
      this.balance -= amount;
    });
  }

  async getHistory(limit: number = 10): Promise<GameHistoryEntry[]> {
    const safeLimit = Math.min(Math.max(limit, 1), config.maxHistoryLimit);
    return this.history.slice(-safeLimit).reverse();
  }

  async addHistoryEntry(entry: GameHistoryEntry): Promise<void> {
    await this.withLock(() => {
      this.history.push(entry);
    });
  }

  async reset(): Promise<void> {
    await this.withLock(() => {
      this.balance = config.initialBalance;
      this.history = [];
    });
  }
}

// Singleton instance
export const gameState = new GameState();
