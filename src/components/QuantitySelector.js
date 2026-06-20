import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../theme/theme';

export const QuantitySelector = ({
  quantity,
  maxQuantity,
  onIncrease,
  onDecrease,
  style
}) => {
  const isMin = quantity <= 1;
  const isMax = quantity >= maxQuantity;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={[styles.button, isMin && styles.disabledButton]} 
        onPress={onDecrease}
        disabled={isMin}
        activeOpacity={0.7}
      >
        <Icon name="remove" size={18} color={isMin ? COLORS.textLight : COLORS.primary} />
      </TouchableOpacity>

      <Text style={styles.quantityText}>{quantity}</Text>

      <TouchableOpacity 
        style={[styles.button, isMax && styles.disabledButton]} 
        onPress={onIncrease}
        disabled={isMax}
        activeOpacity={0.7}
      >
        <Icon name="add" size={18} color={isMax ? COLORS.textLight : COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 2,
    alignSelf: 'flex-start',
  },
  button: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.sm,
    textAlign: 'center',
    minWidth: 32,
  },
});

export default QuantitySelector;
