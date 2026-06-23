import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/theme';

export const CategoryFilter = ({ categories = [], selectedCategory, onSelectCategory }) => {
  const displayCategories = ['All', ...categories];
  const renderItem = ({ item }) => {
    const isSelected = selectedCategory === item;
    return (
      <TouchableOpacity
        style={[
          styles.chip,
          isSelected ? styles.selectedChip : styles.unselectedChip
        ]}
        onPress={() => onSelectCategory(item)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.chipText,
            isSelected ? styles.selectedChipText : styles.unselectedChipText
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.listWrapper}>
      <FlatList
        data={displayCategories}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listWrapper: {
    marginVertical: 12,
  },
  container: {
    paddingVertical: 4,
    paddingRight: SPACING.md,
  },
  chip: {
    paddingHorizontal: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  unselectedChip: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  selectedChipText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  unselectedChipText: {
    color: '#4B5563',
  },
});

export default CategoryFilter;
