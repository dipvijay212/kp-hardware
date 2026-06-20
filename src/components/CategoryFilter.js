import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/theme';

const CATEGORIES = ['All', 'Tools', 'Electrical', 'Plumbing', 'Painting', 'Safety'];

export const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
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
        data={CATEGORIES}
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
    marginVertical: SPACING.xs,
  },
  container: {
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.md,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    height: 40, // Compact chips (height 40-45)
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.round, // Fully rounded chips
    marginRight: SPACING.sm,
    borderWidth: 1,
  },
  selectedChip: {
    backgroundColor: COLORS.primary, // Primary navy blue (#0A1E6A)
    borderColor: COLORS.primary,
  },
  unselectedChip: {
    backgroundColor: COLORS.secondary, // Light grey background (#F5F7FA)
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  selectedChipText: {
    color: COLORS.white,
  },
  unselectedChipText: {
    color: COLORS.textPrimary,
  },
});

export default CategoryFilter;
