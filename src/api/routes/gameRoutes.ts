import { Router } from 'express';
import { checkGameResult, getGames } from '../controllers/gamesControllers';

const router = Router();

//router.use(/** TODO: middleware */);

router.get('/:sceneId', getGames);
router.post('/submitSelection/:selectionId', checkGameResult);

export default router;