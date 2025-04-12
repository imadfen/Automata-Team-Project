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
        setLoading(true);
        const robotConfig = await robotConfigService.getConfig();
        setConfig(robotConfig);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch robot configuration'));
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const refreshConfig = async () => {
    try {
      setLoading(true);
      const robotConfig = await robotConfigService.refreshConfig();
      setConfig(robotConfig);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh robot configuration'));
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, error, refreshConfig };
}; 