import { Request, Response } from 'express';
import { WarehouseLayout, IWarehouseLayout } from '../models/WarehouseLayout';

export const warehouseLayoutController = {
  // Get all warehouse layouts
  async getAllLayouts(req: Request, res: Response) {
    try {
      const layouts = await WarehouseLayout.find().sort({ createdAt: -1 });
      res.json(layouts);
    } catch (error) {
      console.error('Error fetching warehouse layouts:', error);
      res.status(500).json({ message: 'Error fetching warehouse layouts', error });
    }
  },

  // Get a specific warehouse layout by ID
  async getLayoutById(req: Request, res: Response) {
    try {
      const layout = await WarehouseLayout.findById(req.params.id);
      if (!layout) {
        return res.status(404).json({ message: 'Warehouse layout not found' });
      }
      res.json(layout);
    } catch (error) {
      console.error('Error fetching warehouse layout:', error);
      res.status(500).json({ message: 'Error fetching warehouse layout', error });
    }
  },

  // Get the default warehouse layout
  async getDefaultLayout(req: Request, res: Response) {
    try {
      const layout = await WarehouseLayout.findOne({ isDefault: true });
      if (!layout) {
        return res.status(404).json({ message: 'No default warehouse layout found' });
      }
      res.json(layout);
    } catch (error) {
      console.error('Error fetching default warehouse layout:', error);
      res.status(500).json({ message: 'Error fetching default warehouse layout', error });
    }
  },

  // Create a new warehouse layout
  async createLayout(req: Request, res: Response) {
    try {
      const layoutData = req.body;
      
      // Delete all existing layouts - we only want one layout
      await WarehouseLayout.deleteMany({});
      
      // Set this layout as default since it's the only one
      layoutData.isDefault = true;
      
      // Ensure shelves is processed correctly - it comes as an object from the client
      if (layoutData.shelves && typeof layoutData.shelves === 'object' && !(layoutData.shelves instanceof Map)) {
        // Convert to Map if it's a plain object
        layoutData.shelves = new Map(Object.entries(layoutData.shelves));
      }
      
      const newLayout = await WarehouseLayout.create(layoutData);
      res.status(201).json(newLayout);
    } catch (error) {
      console.error('Error creating warehouse layout:', error);
      res.status(500).json({ message: 'Error creating warehouse layout', error });
    }
  },

  // Update an existing warehouse layout
  async updateLayout(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const layoutData = req.body;
      
      // Always set as default since it's the only layout
      layoutData.isDefault = true;
      
      // Ensure shelves is processed correctly - it comes as an object from the client
      if (layoutData.shelves && typeof layoutData.shelves === 'object' && !(layoutData.shelves instanceof Map)) {
        // Convert to Map if it's a plain object
        layoutData.shelves = new Map(Object.entries(layoutData.shelves));
      }
      
      const updatedLayout = await WarehouseLayout.findByIdAndUpdate(
        id,
        layoutData,
        { new: true, runValidators: true }
      );
      
      if (!updatedLayout) {
        return res.status(404).json({ message: 'Warehouse layout not found' });
      }
      
      res.json(updatedLayout);
    } catch (error) {
      console.error('Error updating warehouse layout:', error);
      res.status(500).json({ message: 'Error updating warehouse layout', error });
    }
  },

  // Delete a warehouse layout
  async deleteLayout(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedLayout = await WarehouseLayout.findByIdAndDelete(id);
      
      if (!deletedLayout) {
        return res.status(404).json({ message: 'Warehouse layout not found' });
      }
      
      res.json({ message: 'Warehouse layout deleted successfully' });
    } catch (error) {
      console.error('Error deleting warehouse layout:', error);
      res.status(500).json({ message: 'Error deleting warehouse layout', error });
    }
  }
}; 