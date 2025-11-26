/**
 * Custom error classes for the Roulette API
 */

export class AppError extends Error {
    constructor(
        public readonly code: string,
        public readonly message: string,
        public readonly statusCode: number = 400
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super('INVALID_BET', message, 400);
        this.name = 'ValidationError';
    }
}

export class InsufficientBalanceError extends AppError {
    constructor(betAmount: number, balance: number) {
        super(
            'INSUFFICIENT_BALANCE',
            `Total bet amount (${betAmount}) exceeds balance (${balance})`,
            400
        );
        this.name = 'InsufficientBalanceError';
    }
}

export class InvalidBetTypeError extends AppError {
    constructor(betType: string) {
        super('INVALID_BET_TYPE', `Unknown bet type: ${betType}`, 400);
        this.name = 'InvalidBetTypeError';
    }
}
