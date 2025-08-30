import { useState, useEffect } from 'react';
import { Device, Summary } from '../constants/Types';
import { fetchDevices, fetchSummary } from '../services/api';

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [summary, setSummary] = useState<Summary>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [devicesData, summaryData] = await Promise.all([
        fetchDevices(),
        fetchSummary()
      ]);
      setDevices(devicesData);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refresh = () => {
    loadData();
  };

  const updateDevice = (updatedDevice: Device) => {
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === updatedDevice.id ? updatedDevice : device
      )
    );
  };

  return { devices, summary, loading, error, refresh, updateDevice };
};