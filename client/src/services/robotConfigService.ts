import axios from 'axios';
import { IRobotConfig } from '../types/robotConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class RobotConfigService {
  private static instance: RobotConfigService;
  private config: IRobotConfig | null = null;

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
      const response = await axios.get(`${API_URL}/robot-config`);
      this.config = response.data;
      return this.config;
    } catch (error) {
      console.error('Error fetching robot configuration:', error);
      throw error;
    }
  }

  public async refreshConfig(): Promise<IRobotConfig> {
    this.config = null;
    return this.getConfig();
  }
}

export const robotConfigService = RobotConfigService.getInstance(); 