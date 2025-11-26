import { Router } from 'express';
import gameRoutes from './game.routes';

const router = Router();

// Mount game routes
router.use('/', gameRoutes);

export default router;
