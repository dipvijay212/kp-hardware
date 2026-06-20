import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';

export const ProductCard = ({ product }) => {
  const navigation = useNavigation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fallback high quality hardware placeholder image if URL fails
  const imageUri = imageError || !product.image 
    ? 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400' 
    : product.image;

  const handlePress = () => {
    navigation.navigate('ProductDetails', { product });
  };

  const formattedPrice = Number(product.price || 0).toLocaleString('en-IN');

  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.subtle]}
      onPress={handlePress}
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        {/* Skeleton/Placeholder Loader */}
        <View style={styles.imagePlaceholder}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.placeholderLogo}
            resizeMode="contain"
          />
        </View>

        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        {!imageLoaded && !imageError && (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}

        {/* Category badge overlay at top-left of image */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.titleWrapper}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {product.description || 'Professional grade hardware equipment.'}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.price}>₹{formattedPrice}</Text>
          
          <View style={[
            styles.stockIndicator,
            product.stock ? styles.inStock : styles.outOfStock
          ]}>
            <Text style={[
              styles.stockText,
              product.stock ? styles.inStockText : styles.outOfStockText
            ]}>
              {product.stock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg, // 16px
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    margin: SPACING.xs,
    height: 330, // Proportional height to contain all data elegantly
    // Soft shadow effect
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    height: 180, // Requested height: 180
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.08,
  },
  placeholderLogo: {
    width: 60,
    height: 30,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  spinnerContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.xs + 2,
    left: SPACING.xs + 2,
    backgroundColor: 'rgba(10, 30, 106, 0.9)', // Primary dark blue background
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
  },
  infoContainer: {
    padding: SPACING.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  titleWrapper: {
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold, // Bold text
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  brand: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginVertical: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  price: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold, // Highlighted bold price
    color: COLORS.primary,
  },
  stockIndicator: {
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  inStock: {
    backgroundColor: 'rgba(0, 200, 83, 0.15)', // Accent Green with transparency
  },
  outOfStock: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)', // Danger Red with transparency
  },
  stockText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  inStockText: {
    color: COLORS.accent, // Accent color green (#00C853)
  },
  outOfStockText: {
    color: COLORS.danger,
  },
});

export default ProductCard;
