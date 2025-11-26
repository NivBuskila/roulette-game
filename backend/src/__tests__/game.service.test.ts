import { GameService } from '../services/game.service';
import { GameState } from '../models/game-state';
import { RngService } from '../services/rng.service';
import { Bet } from '../types';
import { RED_NUMBERS, BLACK_NUMBERS, PAYOUTS } from '../utils/constants';
import { ValidationError, InsufficientBalanceError, InvalidBetTypeError } from '../utils/errors';
import { config } from '../config';

describe('GameService', () => {
    let gameService: GameService;
    let gameState: GameState;
    let rngService: RngService;

    beforeEach(() => {
        gameService = new GameService();
        gameState = new GameState();
        rngService = new RngService();
    });

    describe('getNumberColor', () => {
        it('should return green for 0', () => {
            expect(gameService.getNumberColor(0)).toBe('green');
        });

        it('should return red for red numbers', () => {
            RED_NUMBERS.forEach(num => {
                expect(gameService.getNumberColor(num)).toBe('red');
            });
        });

        it('should return black for black numbers', () => {
            BLACK_NUMBERS.forEach(num => {
                expect(gameService.getNumberColor(num)).toBe('black');
            });
        });

        it('should cover all numbers 0-36', () => {
            for (let i = 0; i <= 36; i++) {
                const color = gameService.getNumberColor(i);
                expect(['red', 'black', 'green']).toContain(color);
            }
        });
    });

    describe('checkBetWins', () => {
        it('should return true when winning number is in bet numbers', () => {
            const bet: Bet = { type: 'straight', numbers: [17], amount: 10 };
            expect(gameService.checkBetWins(bet, 17)).toBe(true);
        });

        it('should return false when winning number is not in bet numbers', () => {
            const bet: Bet = { type: 'straight', numbers: [17], amount: 10 };
            expect(gameService.checkBetWins(bet, 18)).toBe(false);
        });

        it('should work with multiple numbers (split bet)', () => {
            const bet: Bet = { type: 'split', numbers: [17, 18], amount: 10 };
            expect(gameService.checkBetWins(bet, 17)).toBe(true);
            expect(gameService.checkBetWins(bet, 18)).toBe(true);
            expect(gameService.checkBetWins(bet, 19)).toBe(false);
        });

        it('should work with outside bets (red)', () => {
            const bet: Bet = { type: 'red', numbers: RED_NUMBERS, amount: 10 };
            expect(gameService.checkBetWins(bet, 1)).toBe(true);   // 1 is red
            expect(gameService.checkBetWins(bet, 2)).toBe(false);  // 2 is black
            expect(gameService.checkBetWins(bet, 0)).toBe(false);  // 0 is green
        });
    });

    describe('calculatePayout', () => {
        it('should calculate straight bet payout (35:1)', () => {
            const bet: Bet = { type: 'straight', numbers: [17], amount: 10 };
            expect(gameService.calculatePayout(bet)).toBe(360); // 10 * 35 + 10
        });

        it('should calculate split bet payout (17:1)', () => {
            const bet: Bet = { type: 'split', numbers: [17, 18], amount: 10 };
            expect(gameService.calculatePayout(bet)).toBe(180); // 10 * 17 + 10
        });

        it('should calculate street bet payout (11:1)', () => {
            const bet: Bet = { type: 'street', numbers: [1, 2, 3], amount: 10 };
            expect(gameService.calculatePayout(bet)).toBe(120); // 10 * 11 + 10
        });

        it('should calculate corner bet payout (8:1)', () => {
            const bet: Bet = { type: 'corner', numbers: [1, 2, 4, 5], amount: 10 };
            expect(gameService.calculatePayout(bet)).toBe(90); // 10 * 8 + 10
        });

        it('should calculate line bet payout (5:1)', () => {
            const bet: Bet = { type: 'line', numbers: [1, 2, 3, 4, 5, 6], amount: 10 };
            expect(gameService.calculatePayout(bet)).toBe(60); // 10 * 5 + 10
        });

        it('should calculate column bet payout (2:1)', () => {
            const bet: Bet = { type: 'column', numbers: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34], amount: 10 };
            expect(gameService.calculatePayout(bet)).toBe(30); // 10 * 2 + 10
        });

        it('should calculate dozen bet payout (2:1)', () => {
            const bet: Bet = { type: 'dozen', numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], amount: 10 };
            expect(gameService.calculatePayout(bet)).toBe(30); // 10 * 2 + 10
        });

        it('should calculate even money bets payout (1:1)', () => {
            const evenMoneyTypes: Array<Bet['type']> = ['red', 'black', 'odd', 'even', 'low', 'high'];
            evenMoneyTypes.forEach(type => {
                const bet: Bet = { type, numbers: [1], amount: 10 };
                expect(gameService.calculatePayout(bet)).toBe(20); // 10 * 1 + 10
            });
        });

        it('should throw error for invalid bet type', () => {
            const bet = { type: 'invalid' as any, numbers: [1], amount: 10 };
            expect(() => gameService.calculatePayout(bet)).toThrow(InvalidBetTypeError);
        });
    });

    describe('validateBet', () => {
        it('should accept valid bet', () => {
            const bet: Bet = { type: 'straight', numbers: [17], amount: 10 };
            expect(() => gameService.validateBet(bet)).not.toThrow();
        });

        it('should reject negative amount', () => {
            const bet: Bet = { type: 'straight', numbers: [17], amount: -10 };
            expect(() => gameService.validateBet(bet)).toThrow(ValidationError);
        });

        it('should reject zero amount', () => {
            const bet: Bet = { type: 'straight', numbers: [17], amount: 0 };
            expect(() => gameService.validateBet(bet)).toThrow(ValidationError);
        });

        it('should reject invalid bet type', () => {
            const bet = { type: 'invalid' as any, numbers: [17], amount: 10 };
            expect(() => gameService.validateBet(bet)).toThrow(InvalidBetTypeError);
        });

        it('should reject empty numbers array', () => {
            const bet: Bet = { type: 'straight', numbers: [], amount: 10 };
            expect(() => gameService.validateBet(bet)).toThrow(ValidationError);
        });

        it('should reject invalid numbers (< 0)', () => {
            const bet: Bet = { type: 'straight', numbers: [-1], amount: 10 };
            expect(() => gameService.validateBet(bet)).toThrow(ValidationError);
        });

        it('should reject invalid numbers (> 36)', () => {
            const bet: Bet = { type: 'straight', numbers: [37], amount: 10 };
            expect(() => gameService.validateBet(bet)).toThrow(ValidationError);
        });

        it('should reject non-integer numbers', () => {
            const bet: Bet = { type: 'straight', numbers: [17.5], amount: 10 };
            expect(() => gameService.validateBet(bet)).toThrow(ValidationError);
        });
    });

    describe('validateBets', () => {
        it('should accept valid array of bets', () => {
            const bets: Bet[] = [
                { type: 'straight', numbers: [17], amount: 10 },
                { type: 'red', numbers: RED_NUMBERS, amount: 20 }
            ];
            expect(() => gameService.validateBets(bets)).not.toThrow();
        });

        it('should reject non-array', () => {
            expect(() => gameService.validateBets(null)).toThrow(ValidationError);
            expect(() => gameService.validateBets(undefined)).toThrow(ValidationError);
            expect(() => gameService.validateBets('not array')).toThrow(ValidationError);
        });

        it('should reject empty array', () => {
            expect(() => gameService.validateBets([])).toThrow(ValidationError);
        });
    });

    describe('Payout calculations match spec', () => {
        it('should have correct payout multipliers', () => {
            expect(PAYOUTS.straight).toBe(35);
            expect(PAYOUTS.split).toBe(17);
            expect(PAYOUTS.street).toBe(11);
            expect(PAYOUTS.corner).toBe(8);
            expect(PAYOUTS.line).toBe(5);
            expect(PAYOUTS.column).toBe(2);
            expect(PAYOUTS.dozen).toBe(2);
            expect(PAYOUTS.red).toBe(1);
            expect(PAYOUTS.black).toBe(1);
            expect(PAYOUTS.odd).toBe(1);
            expect(PAYOUTS.even).toBe(1);
            expect(PAYOUTS.low).toBe(1);
            expect(PAYOUTS.high).toBe(1);
        });
    });
});

describe('GameState', () => {
    let gameState: GameState;

    beforeEach(() => {
        gameState = new GameState();
    });

    it('should start with initial balance', async () => {
        const balance = await gameState.getBalance();
        expect(balance).toBe(config.initialBalance);
    });

    it('should add to balance', async () => {
        await gameState.addToBalance(100);
        const balance = await gameState.getBalance();
        expect(balance).toBe(config.initialBalance + 100);
    });

    it('should subtract from balance', async () => {
        await gameState.subtractFromBalance(100);
        const balance = await gameState.getBalance();
        expect(balance).toBe(config.initialBalance - 100);
    });

    it('should reset to initial state', async () => {
        await gameState.subtractFromBalance(500);
        await gameState.reset();
        const balance = await gameState.getBalance();
        expect(balance).toBe(config.initialBalance);
    });
});
