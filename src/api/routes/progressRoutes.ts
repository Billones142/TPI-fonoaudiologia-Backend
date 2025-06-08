import { Router } from 'express';
import { getProgressedScenes, getSceneProgressController } from '../controllers/progressControllers';

const router = Router();

router.use();

router.get('/getProgressedScenes', getProgressedScenes);
router.get('/:sceneId', getSceneProgressController);

export default router;