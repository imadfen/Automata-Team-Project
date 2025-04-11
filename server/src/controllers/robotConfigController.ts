import { Request, Response } from 'express';
import { RobotConfig } from '../models/RobotConfig';
import { IRobotConfig } from '../models/RobotConfig';

export const robotConfigController = {
  // Get the current robot configuration
  async getConfig(req: Request, res: Response) {
    try {
      const config = await RobotConfig.findOne();
      if (!config) {
        return res.status(404).json({ message: 'Robot configuration not found' });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching robot configuration', error });
    }
  },

  // Update the robot configuration
  async updateConfig(req: Request, res: Response) {
    try {
      const configData: IRobotConfig = req.body;
      const config = await RobotConfig.findOne();
      
      if (config) {
        // Update existing config
        Object.assign(config, configData);
        await config.save();
      } else {
        // Create new config
        await RobotConfig.create(configData);
      }
      
      res.json({ message: 'Robot configuration updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating robot configuration', error });
    }
  },

  // Reset the robot configuration to default values
  async resetConfig(req: Request, res: Response) {
    try {
      const defaultConfig: IRobotConfig = {
        forwardTime: 1,
        turnTime: 2,
        gridSize: 120,
        gridCellSize: 10,
        shelfDimensions: {
          width: 15,
          depth: 30,
          height: 180
        },
        robotDimensions: {
          width: 30,
          length: 40
        },
        aisleWidth: 45
      };

      await RobotConfig.deleteMany({});
      await RobotConfig.create(defaultConfig);
      
      res.json({ message: 'Robot configuration reset to default values' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting robot configuration', error });
    }
  }
}; 