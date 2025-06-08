import { Router } from 'express';
import { getProgressedScenesController, getSceneProgressController } from '../controllers/progressControllers';

const router = Router();

router.use();

router.get('/getProgressedScenes', getProgressedScenesController);
router.get('/:sceneId', getSceneProgressController);

export default router;