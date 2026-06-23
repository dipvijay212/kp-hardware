import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme/theme';

export const SearchBar = ({ value, onChangeText, placeholder = "Search hardware products" }) => {
  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.container}>
        <Icon name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          autoCapitalize="none"
          clearButtonMode="never" // Custom clear button is handled below
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton} activeOpacity={0.7}>
            <Icon name="close-circle" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    marginVertical: SPACING.sm,
    // Soft shadow effect
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
    fontWeight: '500',
  },
  clearButton: {
    padding: SPACING.xs,
  },
});

export default SearchBar;
