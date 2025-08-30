import { Device } from '../constants/Types';
import { COLORS } from '../constants/Colors';

export const getDeviceIcon = (category?: string): string => {
  const categoryIcons: Record<string, string> = {
    smartphone: 'phone-portrait',
    laptop: 'laptop',
    desktop: 'desktop',
    tablet: 'tablet-portrait',
    smart_tv: 'tv',
    gaming_console: 'game-controller',
    smart_speaker: 'volume-high',
    router: 'wifi',
    printer: 'print',
    camera: 'camera',
    smart_home: 'home',
    wearable: 'watch',
    server: 'server',
    network: 'hardware-chip',
    peripheral: 'keyboard',
    unknown: 'help-circle',
  };

  return category ? categoryIcons[category.toLowerCase()] || 'device-desktop' : 'device-desktop';
};

export const getStatusColor = (device: Device): string => {
  if (!device.is_active) return COLORS.dark;
  if (device.has_custom_blocklist) return COLORS.warning;
  return COLORS.success;
};

export const getRiskLevel = (device: Device): string => {
  const blockedCount = Object.values(device.blocklist).filter(Boolean).length;
  if (blockedCount > 8) return 'high';
  if (blockedCount > 4) return 'medium';
  return 'low';
};

export const getRiskColor = (risk: string): string => {
  switch (risk) {
    case 'high': return COLORS.danger;
    case 'medium': return COLORS.warning;
    default: return COLORS.success;
  }
};

export const getGroupColor = (groupName: string): string => {
  switch (groupName.toLowerCase()) {
    case 'staff': return '#4CAF50';
    case 'guests': return '#FF9800';
    case 'iot': return '#2196F3';
    default: return '#9E9E9E';
  }
};

export const filterDevices = (devices: Device[], searchQuery: string, selectedFilter: string) => {
  return devices.filter((device) => {
    const matchesSearch =
      device.given_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.hostname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.ip?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'active' && device.is_active) ||
      (selectedFilter === 'inactive' && !device.is_active) ||
      (selectedFilter === 'custom' && device.has_custom_blocklist) ||
      (selectedFilter === 'high_risk' && getRiskLevel(device) === 'high') ||
      device.group.name.toLowerCase() === selectedFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });
};