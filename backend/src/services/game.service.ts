import { Bet, BetResult, GameResult, GameHistoryEntry, NumberColor } from '../types';
import { RED_NUMBERS, PAYOUTS, MIN_NUMBER, MAX_NUMBER } from '../utils/constants';
import { ValidationError, InsufficientBalanceError, InvalidBetTypeError } from '../utils/errors';
import { gameState } from '../models/game-state';
import { rngService } from './rng.service';

/**
 * Game Service
 * Handles all game business logic
 */
export class GameService {
  /**
   * Get the color of a number
   */
  getNumberColor(num: number): NumberColor {
    if (num === 0) return 'green';
    if (RED_NUMBERS.includes(num)) return 'red';
    return 'black';
  }

  /**
   * Check if a bet wins for a given number
   */
  checkBetWins(bet: Bet, winningNumber: number): boolean {
    return bet.numbers.includes(winningNumber);
  }

  /**
   * Calculate payout for a winning bet
   * Returns total amount (original bet + winnings)
   */
  calculatePayout(bet: Bet): number {
    const multiplier = PAYOUTS[bet.type];
    if (multiplier === undefined) {
      throw new InvalidBetTypeError(bet.type);
    }
    return bet.amount * multiplier + bet.amount;
  }

  /**
   * Validate a single bet - throws on invalid
   */
  validateBet(bet: Bet): void {
    // Check bet object exists
    if (!bet || typeof bet !== 'object') {
      throw new ValidationError('Bet must be an object');
    }

    // Check amount
    if (typeof bet.amount !== 'number' || !Number.isFinite(bet.amount)) {
      throw new ValidationError('Bet amount must be a valid number');
    }
    
    if (bet.amount <= 0) {
      throw new ValidationError('Bet amount must be positive');
    }

    // Check bet type
    if (!bet.type || !Object.prototype.hasOwnProperty.call(PAYOUTS, bet.type)) {
      throw new InvalidBetTypeError(bet.type || 'undefined');
    }

    // Check numbers array
    if (!bet.numbers || !Array.isArray(bet.numbers) || bet.numbers.length === 0) {
      throw new ValidationError('Bet must have at least one number');
    }

    // Check all numbers are valid (0-36)
    for (const num of bet.numbers) {
      if (typeof num !== 'number' || num < MIN_NUMBER || num > MAX_NUMBER || !Number.isInteger(num)) {
        throw new ValidationError(`Invalid number in bet: ${num}`);
      }
    }
  }

  /**
   * Validate array of bets
   */
  validateBets(bets: unknown): asserts bets is Bet[] {
    if (!bets || !Array.isArray(bets)) {
      throw new ValidationError('Bets must be an array');
    }
    
    if (bets.length === 0) {
      throw new ValidationError('At least one bet is required');
    }

    for (const bet of bets) {
      this.validateBet(bet as Bet);
    }
  }

  /**
   * Process a spin with multiple bets
   */
  async processSpin(bets: Bet[]): Promise<GameResult> {
    // Validate all bets first
    this.validateBets(bets);

    // Calculate total bet amount
    const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);

    // Check balance
    const currentBalance = await gameState.getBalance();
    if (totalBetAmount > currentBalance) {
      throw new InsufficientBalanceError(totalBetAmount, currentBalance);
    }

    // Deduct bets from balance
    await gameState.subtractFromBalance(totalBetAmount);

    // Generate winning number
    const winningNumber = rngService.generateWinningNumber();
    const winningColor = this.getNumberColor(winningNumber);

    // Process each bet
    const betResults: BetResult[] = bets.map(bet => {
      const won = this.checkBetWins(bet, winningNumber);
      const payout = won ? this.calculatePayout(bet) : 0;
      
      return {
        ...bet,
        won,
        payout
      };
    });

    // Calculate total winnings
    const totalWinAmount = betResults.reduce((sum, bet) => sum + bet.payout, 0);
    
    // Add winnings to balance
    await gameState.addToBalance(totalWinAmount);

    const netProfit = totalWinAmount - totalBetAmount;
    const newBalance = await gameState.getBalance();

    // Add to history
    const historyEntry: GameHistoryEntry = {
      timestamp: new Date().toISOString(),
      winningNumber,
      winningColor,
      totalBetAmount,
      totalWinAmount,
      netProfit
    };
    await gameState.addHistoryEntry(historyEntry);

    return {
      winningNumber,
      winningColor,
      totalBetAmount,
      totalWinAmount,
      netProfit,
      newBalance,
      bets: betResults
    };
  }

  /**
   * Get current balance
   */
  async getBalance(): Promise<number> {
    return gameState.getBalance();
  }

  /**
   * Get game history
   */
  async getHistory(limit: number = 10): Promise<GameHistoryEntry[]> {
    return gameState.getHistory(limit);
  }

  /**
   * Reset game state
   */
  async reset(): Promise<number> {
    await gameState.reset();
    rngService.reset();
    return gameState.getBalance();
  }
}

// Singleton instance
export const gameService = new GameService();
