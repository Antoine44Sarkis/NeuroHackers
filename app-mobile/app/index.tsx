import React, { useState } from 'react';
import { View, Text, ScrollView, StatusBar, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { useDevices } from '../hooks/useDevices';
import { useDeviceActions } from '../hooks/useDeviceActions';
import { filterDevices } from '../utils/deviceUtils';
import { ViewMode } from '../constants/Types';
import { COLORS } from '../constants/Colors';

import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ViewToggle from '../components/ViewToggle';
import DeviceGridItem from '../components/DeviceGridItem';
import DeviceListView from '../components/DeviceListView';
import DeviceRadialView from '../components/DeviceRadialView';
import DeviceModal from '../components/DeviceModal';

const { width } = Dimensions.get('window');

export default function App() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const { devices, summary, loading, refresh, updateDevice } = useDevices();
  const { performAction } = useDeviceActions(updateDevice);

  const filteredDevices = filterDevices(devices, searchQuery, selectedFilter);

  const handleDevicePress = (device: any) => {
    setSelectedDevice(device);
    setModalVisible(true);
  };

  const handleAction = async (deviceId: number, action: string, category?: string) => {
    // Call performAction and get the updated device directly
    const updatedDevice = await performAction(deviceId, action, category);
    // If the modal is open and the selected device is the one being updated, update its state immediately
    if (selectedDevice && selectedDevice.id === deviceId && updatedDevice) {
      setSelectedDevice(updatedDevice);
    }
  };

  const renderDevices = () => {
    if (viewMode === 'radial') {
      return <DeviceRadialView devices={filteredDevices} onDevicePress={handleDevicePress} />;
    }
    
    return filteredDevices.map((device) => (
      viewMode === 'grid' 
        ? <DeviceGridItem key={device.id} device={device} onPress={handleDevicePress} />
        : <DeviceListView key={device.id} device={device} onPress={handleDevicePress} />
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Chimera Devices</Text>
          <Text style={styles.headerSubtitle}>
            {summary.active || 0}/{summary.total || 0} Active
          </Text>
        </View>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </View>

      <View style={styles.controls}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <FilterBar selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
      </View>

      <ScrollView
        style={styles.deviceList}
        contentContainerStyle={viewMode === 'grid' ? styles.gridContainer : {}}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={refresh} 
          />
        }
      >
        {renderDevices()}

        {filteredDevices.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No devices found</Text>
          </View>
        )}
      </ScrollView>

      <DeviceModal
        visible={modalVisible}
        device={selectedDevice}
        onClose={() => setModalVisible(false)}
        onAction={handleAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    backgroundColor: COLORS.primary, 
    paddingTop: 50, 
    paddingBottom: 15, 
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 4,
  },
  headerSubtitle: {
    color: COLORS.success, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  controls: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  deviceList: { 
    flex: 1, 
    padding: 15 
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
});