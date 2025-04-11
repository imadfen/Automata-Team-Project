import { Router } from 'express';
import { robotConfigController } from '../controllers/robotConfigController';

const router = Router();

// Get current robot configuration
router.get('/', robotConfigController.getConfig);

// Update robot configuration
router.put('/', robotConfigController.updateConfig);

// Reset robot configuration to default values
router.post('/reset', robotConfigController.resetConfig);

export default router; 