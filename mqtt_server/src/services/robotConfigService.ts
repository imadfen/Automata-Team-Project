import axios from 'axios';
import { IRobotConfig } from '../types/robotConfig';

class RobotConfigService {
  private static instance: RobotConfigService;
  private config: IRobotConfig | null = null;
  private readonly API_URL = process.env.API_URL || 'http://localhost:5000';

  private constructor() {}

  public static getInstance(): RobotConfigService {
    if (!RobotConfigService.instance) {
      RobotConfigService.instance = new RobotConfigService();
    }
    return RobotConfigService.instance;
  }

  public async getConfig(): Promise<IRobotConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const response = await axios.get(`${this.API_URL}/robot-config`);
      this.config = response.data;
      return this.config;
    } catch (error) {
      console.error('Error fetching robot configuration:', error);
      throw error;
    }
  }

  public async updateConfig(newConfig: IRobotConfig): Promise<void> {
    try {
      await axios.put(`${this.API_URL}/robot-config`, newConfig);
      this.config = newConfig;
    } catch (error) {
      console.error('Error updating robot configuration:', error);
      throw error;
    }
  }

  public async resetConfig(): Promise<void> {
    try {
      await axios.post(`${this.API_URL}/robot-config/reset`);
      await this.getConfig(); // Refresh the local config
    } catch (error) {
      console.error('Error resetting robot configuration:', error);
      throw error;
    }
  }
}

export const robotConfigService = RobotConfigService.getInstance(); 