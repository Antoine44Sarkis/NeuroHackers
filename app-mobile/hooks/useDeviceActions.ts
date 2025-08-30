import { useState } from 'react';
import { Device } from '../constants/Types';
import { performDeviceAction } from '../services/api';
import * as Haptics from 'expo-haptics';

export const useDeviceActions = (updateDevice: (device: Device) => void) => {
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const performAction = async (
    deviceId: number,
    action: string,
    category: string | null = null
  ): Promise<void> => {
    try {
      setActionLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const updatedDevice = await performDeviceAction(deviceId, action, category);
      updateDevice(updatedDevice);
      
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return { performAction, actionLoading };
};