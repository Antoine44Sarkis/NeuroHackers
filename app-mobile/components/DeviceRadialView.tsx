import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Device } from '../constants/Types';
import { getDeviceIcon, getStatusColor, getGroupColor } from '../utils/deviceUtils';

interface DeviceRadialViewProps {
  devices: Device[];
  onDevicePress: (device: Device) => void;
}

const DeviceRadialView: React.FC<DeviceRadialViewProps> = ({ devices, onDevicePress }) => {
  const categories: { [key: string]: Device[] } = {};
  devices.forEach(device => {
    const category = device.ai_classification.device_category;
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(device);
  });

  return (
    <View style={styles.radialContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.entries(categories).map(([category, categoryDevices]) => (
          <View key={category} style={styles.radialCategory}>
            <Text style={styles.radialCategoryTitle}>{category}</Text>
            <View style={styles.radialItems}>
              {categoryDevices.map(device => (
                <TouchableOpacity
                  key={device.id}
                  style={[
                    styles.radialItem,
                    { 
                      backgroundColor: getGroupColor(device.group.name),
                      borderColor: getStatusColor(device),
                      borderWidth: device.is_active ? 2 : 0,
                    }
                  ]}
                  onPress={() => onDevicePress(device)}
                >
                  <Ionicons
                    name={getDeviceIcon(device.ai_classification.device_category) as any}
                    size={16}
                    color="white"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  radialContainer: {
    paddingBottom: 20,
  },
  radialCategory: {
    marginRight: 20,
  },
  radialCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  radialItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width - 60,
  },
  radialItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});

export default DeviceRadialView;