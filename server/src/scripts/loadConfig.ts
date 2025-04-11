import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { RobotConfig } from '../models/RobotConfig.js';

dotenv.config();

const defaultConfig = {
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

async function loadConfig() {
  try {
    // Connect to the database
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing configuration
    await RobotConfig.deleteMany({});
    console.log('Cleared existing configuration');

    // Create new configuration document
    const robotConfig = new RobotConfig(defaultConfig);
    
    // Explicitly save the configuration
    await robotConfig.save();
    console.log('Successfully saved robot configuration to MongoDB');

    // Verify the configuration
    const config = await RobotConfig.findOne();
    console.log('Current configuration in database:', config);

    process.exit(0);
  } catch (error) {
    console.error('Error loading configuration:', error);
    process.exit(1);
  }
}

loadConfig(); 