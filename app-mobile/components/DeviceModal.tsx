import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Device } from '../constants/Types';
import { getDeviceIcon, getStatusColor, getRiskLevel, getRiskColor, getGroupColor } from '../utils/deviceUtils';
import { COLORS } from '../constants/Colors';

interface DeviceModalProps {
  visible: boolean;
  device: Device | null;
  onClose: () => void;
  onAction: (deviceId: number, action: string, category?: string) => void;
}

const DeviceModal: React.FC<DeviceModalProps> = ({ visible, device, onClose, onAction }) => {
  if (!device) return null;

  const riskLevel = getRiskLevel(device);
  const riskColor = getRiskColor(riskLevel);
  const statusColor = getStatusColor(device);
  const groupColor = getGroupColor(device.group.name);
  
  return (
    <Modal 
      animationType="slide" 
      transparent 
      visible={visible} 
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleSection}>
              <Ionicons
                name={getDeviceIcon(device.ai_classification.device_category) as any}
                size={28}
                color={groupColor}
              />
              <Text style={styles.modalTitle} numberOfLines={1}>
                {device.given_name || device.hostname}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.deviceStatusOverview}>
              <View style={styles.statusBadge}>
                <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                <Text style={styles.statusText}>
                  {device.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Ionicons name="shield" size={16} color={riskColor} />
                <Text style={[styles.statusText, { color: riskColor }]}>
                  {riskLevel.toUpperCase()} RISK
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Ionicons name="people" size={16} color={groupColor} />
                <Text style={[styles.statusText, { color: groupColor }]}>
                  {device.group.name}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.isolateButton]}
                onPress={() => {
                  onAction(device.id, 'isolate');
                }}
              >
                <Ionicons name="shield" size={20} color="white" />
                <Text style={styles.actionButtonText}>Isolate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.releaseButton]}
                onPress={() => {
                  onAction(device.id, 'release');
                }}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>Release</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.blocklistSection}>
              <Text style={styles.sectionTitle}>Blocklist Categories</Text>
              <View style={styles.blocklistGrid}>
                {Object.entries(device.blocklist).map(([category, blocked]) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.blocklistChip,
                      { backgroundColor: blocked ? COLORS.danger : '#e0e0e0' }
                    ]}
                    onPress={() => {
                      onAction(device.id, 'toggle_block', category);
                    }}
                  >
                    <Text style={[
                      styles.blocklistCategory,
                      { color: blocked ? 'white' : '#666' }
                    ]}>
                      {category.replace('_', ' ').toUpperCase()}
                    </Text>
                    <Ionicons 
                      name={blocked ? 'close-circle' : 'add-circle'} 
                      size={16} 
                      color={blocked ? 'white' : '#666'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.deviceDetails}>
              <Text style={styles.sectionTitle}>Device Details</Text>
              <View style={styles.detailRow}>
                <Ionicons name="globe" size={16} color="#666" />
                <Text style={styles.detailItem}>IP: {device.ip || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="hardware-chip" size={16} color="#666" />
                <Text style={styles.detailItem}>MAC: {device.mac || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="logo-windows" size={16} color="#666" />
                <Text style={styles.detailItem}>
                  OS: {device.os_name} ({device.os_accuracy}% confidence)
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="pricetag" size={16} color="#666" />
                <Text style={styles.detailItem}>Category: {device.ai_classification.device_category}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.detailItem}>
                  Last Seen: {device.last_seen ? new Date(device.last_seen).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  deviceStatusOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  isolateButton: {
    backgroundColor: COLORS.danger,
  },
  releaseButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  blocklistSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  blocklistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  blocklistChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  blocklistCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  deviceDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

export default DeviceModal;