import { Router } from 'express';
import { gameController } from '../controllers/game.controller';
import { asyncHandler } from '../middleware/async-handler';

const router = Router();

/**
 * @route   GET /api/balance
 * @desc    Get current player balance
 */
router.get('/balance', asyncHandler((req, res) => gameController.getBalance(req, res)));

/**
 * @route   POST /api/game/spin
 * @desc    Place bets and spin the wheel
 */
router.post('/game/spin', asyncHandler((req, res) => gameController.spin(req, res)));

/**
 * @route   GET /api/game/history
 * @desc    Get game history
 */
router.get('/game/history', asyncHandler((req, res) => gameController.getHistory(req, res)));

/**
 * @route   POST /api/game/reset
 * @desc    Reset game state (for testing)
 */
router.post('/game/reset', asyncHandler((req, res) => gameController.reset(req, res)));

export default router;
