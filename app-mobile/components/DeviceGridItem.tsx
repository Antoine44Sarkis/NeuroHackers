import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Device } from '../constants/Types';
import { getDeviceIcon, getStatusColor, getRiskLevel, getRiskColor, getGroupColor } from '../utils/deviceUtils';

interface DeviceGridItemProps {
  device: Device;
  onPress: (device: Device) => void;
}

const DeviceGridItem: React.FC<DeviceGridItemProps> = ({ device, onPress }) => {
  const riskLevel = getRiskLevel(device);
  const riskColor = getRiskColor(riskLevel);
  const statusColor = getStatusColor(device);
  const groupColor = getGroupColor(device.group.name);
  const blockedCount = Object.values(device.blocklist).filter(Boolean).length;
  
  return (
    <TouchableOpacity
      style={[styles.gridItem, { borderLeftColor: groupColor }]}
      onPress={() => onPress(device)}
      activeOpacity={0.7}
    >
      <View style={styles.gridHeader}>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
        <Ionicons
          name={getDeviceIcon(device.ai_classification.device_category) as any}
          size={24}
          color={groupColor}
          style={styles.gridIcon}
        />
      </View>
      
      <Text style={styles.gridName} numberOfLines={1}>
        {device.given_name || device.hostname}
      </Text>
      
      <Text style={styles.gridGroup} numberOfLines={1}>
        {device.group.name}
      </Text>
      
      <View style={styles.gridMetrics}>
        <View style={styles.metricBadge}>
          <Ionicons name="shield" size={12} color={riskColor} />
          <Text style={[styles.metricText, { color: riskColor }]}>
            {riskLevel.toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.metricBadge}>
          <Ionicons name="lock-closed" size={12} color="#333" />
          <Text style={styles.metricText}>
            {blockedCount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridItem: {
    width: (Dimensions.get('window').width - 40) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gridIcon: {
    alignSelf: 'flex-end',
  },
  gridName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  gridGroup: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  gridMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  metricText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default DeviceGridItem;