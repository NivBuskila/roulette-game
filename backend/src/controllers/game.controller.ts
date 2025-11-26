import { Request, Response } from 'express';
import { gameService } from '../services/game.service';
import { SpinRequest, HistoryQuery } from '../types';

/**
 * Game Controller
 * Handles HTTP request/response logic
 */
export class GameController {
    /**
     * GET /api/balance
     * Returns current player balance
     */
    async getBalance(req: Request, res: Response): Promise<void> {
        const balance = await gameService.getBalance();
        res.json({ balance });
    }

    /**
     * POST /api/game/spin
     * Place bets and spin the wheel
     */
    async spin(req: Request<{}, {}, SpinRequest>, res: Response): Promise<void> {
        const { bets } = req.body;
        const result = await gameService.processSpin(bets);

        res.json({
            success: true,
            result
        });
    }

    /**
     * GET /api/game/history
     * Returns game history
     */
    async getHistory(req: Request<{}, {}, {}, HistoryQuery>, res: Response): Promise<void> {
        const limit = parseInt(req.query.limit || '10', 10);
        const history = await gameService.getHistory(limit);

        res.json({ history });
    }

    /**
     * POST /api/game/reset
     * Reset game state (for testing)
     */
    async reset(req: Request, res: Response): Promise<void> {
        const balance = await gameService.reset();

        res.json({
            success: true,
            balance
        });
    }
}

// Singleton instance
export const gameController = new GameController();
