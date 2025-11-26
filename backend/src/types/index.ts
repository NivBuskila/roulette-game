// Bet Types
export type BetType =
  | 'straight'  // Single number - 35:1
  | 'split'     // Two adjacent numbers - 17:1
  | 'street'    // Three numbers in a row - 11:1
  | 'corner'    // Four numbers in a square - 8:1
  | 'line'      // Six numbers (two streets) - 5:1
  | 'column'    // Column (12 numbers) - 2:1
  | 'dozen'     // Dozen (12 numbers) - 2:1
  | 'red'       // All red numbers - 1:1
  | 'black'     // All black numbers - 1:1
  | 'odd'       // All odd numbers - 1:1
  | 'even'      // All even numbers - 1:1
  | 'low'       // 1-18 - 1:1
  | 'high';     // 19-36 - 1:1

export type NumberColor = 'red' | 'black' | 'green';

// Bet interface
export interface Bet {
  type: BetType;
  numbers: number[];
  amount: number;
}

// Bet result after spin
export interface BetResult extends Bet {
  won: boolean;
  payout: number;
}

// Game result
export interface GameResult {
  winningNumber: number;
  winningColor: NumberColor;
  totalBetAmount: number;
  totalWinAmount: number;
  netProfit: number;
  newBalance: number;
  bets: BetResult[];
}

// Game history entry
export interface GameHistoryEntry {
  timestamp: string;
  winningNumber: number;
  winningColor: NumberColor;
  totalBetAmount: number;
  totalWinAmount: number;
  netProfit: number;
}

// API Response types
export interface SuccessResponse<T> {
  success: true;
  result?: T;
  balance?: number;
  history?: GameHistoryEntry[];
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Request types
export interface SpinRequest {
  bets: Bet[];
}

export interface HistoryQuery {
  limit?: string;
}
