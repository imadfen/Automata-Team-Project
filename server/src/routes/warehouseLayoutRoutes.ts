import { Router } from 'express';
import { warehouseLayoutController } from '../controllers/warehouseLayoutController';

const router = Router();

// Get all warehouse layouts
router.get('/', warehouseLayoutController.getAllLayouts);

// Get default warehouse layout
router.get('/default', warehouseLayoutController.getDefaultLayout);

// Get a specific warehouse layout
router.get('/:id', warehouseLayoutController.getLayoutById);

// Create a new warehouse layout
router.post('/', warehouseLayoutController.createLayout);

// Update an existing warehouse layout
router.put('/:id', warehouseLayoutController.updateLayout);

// Delete a warehouse layout
router.delete('/:id', warehouseLayoutController.deleteLayout);

export default router; 