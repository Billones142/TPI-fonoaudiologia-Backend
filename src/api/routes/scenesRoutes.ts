import { Router } from "express";
import { getSceneData, getScenes } from "../controllers/scenesControllers";

const router = Router()

router.get('/getScenes', getScenes);
router.get('/:sceneId', getSceneData);

export default router;