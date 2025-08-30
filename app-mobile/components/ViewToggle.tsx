import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ViewMode } from '../constants/Types';
import { COLORS } from '../constants/Colors';

interface ViewToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <View style={styles.viewToggle}>
      <TouchableOpacity
        onPress={() => setViewMode('grid')}
        style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
      >
        <Ionicons 
          name="grid" 
          size={20} 
          color={viewMode === 'grid' ? 'white' : COLORS.primary} 
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setViewMode('list')}
        style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
      >
        <Ionicons 
          name="list" 
          size={20} 
          color={viewMode === 'list' ? 'white' : COLORS.primary} 
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setViewMode('radial')}
        style={[styles.viewButton, viewMode === 'radial' && styles.viewButtonActive]}
      >
        <Ionicons 
          name="disc" 
          size={20} 
          color={viewMode === 'radial' ? 'white' : COLORS.primary} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 2,
  },
  viewButton: {
    padding: 6,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  viewButtonActive: {
    backgroundColor: '#0f3460',
  },
});

export default ViewToggle;