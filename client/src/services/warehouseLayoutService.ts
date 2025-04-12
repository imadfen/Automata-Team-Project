import axios from 'axios';
import { WarehouseState } from '../types/warehouse';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface WarehouseLayoutData {
  _id?: string;
  name: string;
  gridSize: number;
  grid: any[][];
  shelves: Record<string, any>;
  robotPosition: { x: number; y: number };
  robotDirection: number;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class WarehouseLayoutService {
  private static instance: WarehouseLayoutService;

  private constructor() {}

  public static getInstance(): WarehouseLayoutService {
    if (!WarehouseLayoutService.instance) {
      WarehouseLayoutService.instance = new WarehouseLayoutService();
    }
    return WarehouseLayoutService.instance;
  }

  // Convert client state to API format
  private formatLayoutData(state: WarehouseState, name: string, isDefault = false): WarehouseLayoutData {
    return {
      name: name,
      gridSize: state.grid.length,
      grid: state.grid,
      // Convert Map to a plain object for API serialization
      shelves: Object.fromEntries(state.shelves),
      robotPosition: state.robotPosition,
      robotDirection: state.robotDirection,
      isDefault: isDefault
    };
  }

  // Get all warehouse layouts
  public async getAllLayouts(): Promise<WarehouseLayoutData[]> {
    try {
      const response = await axios.get(`${API_URL}/warehouse-layouts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching warehouse layouts:', error);
      throw error;
    }
  }

  // Get a specific warehouse layout by ID
  public async getLayoutById(id: string): Promise<WarehouseLayoutData> {
    try {
      const response = await axios.get(`${API_URL}/warehouse-layouts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching warehouse layout with ID ${id}:`, error);
      throw error;
    }
  }

  // Get the default warehouse layout
  public async getDefaultLayout(): Promise<WarehouseLayoutData> {
    try {
      const response = await axios.get(`${API_URL}/warehouse-layouts/default`);
      return response.data;
    } catch (error) {
      console.error('Error fetching default warehouse layout:', error);
      throw error;
    }
  }

  // Create a new warehouse layout
  public async createLayout(state: WarehouseState, name: string, isDefault = false): Promise<WarehouseLayoutData> {
    try {
      const layoutData = this.formatLayoutData(state, name, isDefault);
      console.log('Sending create layout request with data:', JSON.stringify(layoutData));
      
      const response = await axios.post(`${API_URL}/warehouse-layouts`, layoutData);
      console.log('Create layout response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error creating warehouse layout:', error);
      if (axios.isAxiosError(error)) {
        console.error('Request details:', {
          url: `${API_URL}/warehouse-layouts`,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      throw error;
    }
  }

  // Update an existing warehouse layout
  public async updateLayout(id: string, state: WarehouseState, name: string, isDefault = false): Promise<WarehouseLayoutData> {
    try {
      const layoutData = this.formatLayoutData(state, name, isDefault);
      console.log('Sending update layout request with data:', JSON.stringify(layoutData));
      
      const response = await axios.put(`${API_URL}/warehouse-layouts/${id}`, layoutData);
      console.log('Update layout response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error updating warehouse layout with ID ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Request details:', {
          url: `${API_URL}/warehouse-layouts/${id}`,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      throw error;
    }
  }

  // Delete a warehouse layout
  public async deleteLayout(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/warehouse-layouts/${id}`);
    } catch (error) {
      console.error(`Error deleting warehouse layout with ID ${id}:`, error);
      throw error;
    }
  }
}

export const warehouseLayoutService = WarehouseLayoutService.getInstance(); 