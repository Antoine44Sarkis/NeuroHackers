import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Device } from '../constants/Types';
import { getDeviceIcon, getStatusColor, getRiskLevel, getRiskColor, getGroupColor } from '../utils/deviceUtils';

interface DeviceListViewProps {
  device: Device;
  onPress: (device: Device) => void;
}

const DeviceListView: React.FC<DeviceListViewProps> = ({ device, onPress }) => {
  const riskLevel = getRiskLevel(device);
  const riskColor = getRiskColor(riskLevel);
  const statusColor = getStatusColor(device);
  const groupColor = getGroupColor(device.group.name);
  const blockedCount = Object.values(device.blocklist).filter(Boolean).length;
  
  return (
    <TouchableOpacity
      style={[styles.listItem, { borderLeftColor: groupColor }]}
      onPress={() => onPress(device)}
      activeOpacity={0.7}
    >
      <View style={styles.listHeader}>
        <View style={styles.listInfo}>
          <Ionicons
            name={getDeviceIcon(device.ai_classification.device_category) as any}
            size={20}
            color={groupColor}
          />
          <View style={styles.listText}>
            <Text style={styles.listName} numberOfLines={1}>
              {device.given_name || device.hostname}
            </Text>
            <Text style={styles.listDetails}>
              {device.vendor} • {device.group.name}
            </Text>
          </View>
        </View>
        <View style={styles.listStatus}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.riskLevel, { color: riskColor }]}>
            {riskLevel.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.listMetrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Blocked</Text>
          <Text style={styles.metricValue}>
            {blockedCount}/13
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>OS</Text>
          <Text style={styles.metricValue}>
            {device.os_name} {device.os_accuracy}%
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Last Seen</Text>
          <Text style={styles.metricValue}>
            {device.last_seen ? new Date(device.last_seen).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listText: {
    marginLeft: 12,
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  listStatus: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  riskLevel: {
    fontSize: 10,
    fontWeight: '600',
  },
  listMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
});

export default DeviceListView;