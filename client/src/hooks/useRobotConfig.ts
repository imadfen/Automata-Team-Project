import { useState, useEffect } from 'react';
import { IRobotConfig } from '../types/robotConfig';
import { robotConfigService } from '../services/robotConfigService';

export const useRobotConfig = () => {
  const [config, setConfig] = useState<IRobotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        console.log('Fetching robot configuration...');
        setLoading(true);
        const robotConfig = await robotConfigService.getConfig();
        console.log('Robot configuration fetched:', robotConfig);
        setConfig(robotConfig);
        setError(null);
      } catch (err) {
        console.error('Error fetching robot configuration:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch robot configuration'));
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const refreshConfig = async () => {
    try {
      console.log('Refreshing robot configuration...');
      setLoading(true);
      const robotConfig = await robotConfigService.refreshConfig();
      console.log('Robot configuration refreshed:', robotConfig);
      setConfig(robotConfig);
      setError(null);
    } catch (err) {
      console.error('Error refreshing robot configuration:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh robot configuration'));
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, error, refreshConfig };
}; 