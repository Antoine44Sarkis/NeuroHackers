import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FilterBarProps {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ selectedFilter, setSelectedFilter }) => {
  const filters = ['all', 'active', 'inactive', 'custom', 'high_risk', 'staff', 'guests', 'iot'];

  return (
    <ScrollView horizontal style={styles.filterScroll} showsHorizontalScrollIndicator={false}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
          onPress={() => setSelectedFilter(filter)}
        >
          <Text style={[styles.filterButtonText, selectedFilter === filter && styles.filterButtonTextActive]}>
            {filter.replace('_', ' ').toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterScroll: { 
    flexDirection: 'row' 
  },
  filterButton: { 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 20, 
    marginRight: 10 
  },
  filterButtonActive: { 
    backgroundColor: '#1a1a2e' 
  },
  filterButtonText: { 
    color: '#666', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  filterButtonTextActive: { 
    color: 'white' 
  },
});

export default FilterBar;