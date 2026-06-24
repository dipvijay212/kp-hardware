import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import QuantitySelector from './QuantitySelector';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const product = item.product;
  const imageUri = product.image || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400';
  const itemSubtotal = product.price * item.quantity;

  return (
    <View style={[styles.itemCard, SHADOWS.subtle]}>
      <Image source={{ uri: imageUri }} style={styles.itemImage} resizeMode="cover" />
      
      <View style={styles.itemDetails}>
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={styles.itemName} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.itemBrand} numberOfLines={1}>{product.brand || 'KP Hardware'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => onRemove(product.id)}
            activeOpacity={0.7}
          >
            <Icon name="trash-outline" size={20} color={COLORS.brandRed} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.itemPrice}>₹{product.price.toLocaleString('en-IN')}</Text>
          <Text style={styles.itemSubtotal}>Total: ₹{itemSubtotal.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.controlsRow}>
          <QuantitySelector
            quantity={item.quantity}
            maxQuantity={typeof product.stock === 'number' ? product.stock : 999}
            onIncrease={() => onUpdateQuantity(product.id, item.quantity + 1)}
            onDecrease={() => onUpdateQuantity(product.id, item.quantity - 1)}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg, // 16px
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.secondary,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  itemName: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  itemBrand: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  removeButton: {
    padding: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
});

export default CartItem;
