import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';

export const ProductCard = ({ product }) => {
  const navigation = useNavigation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasValidImage = product.image && !imageError;

  const handlePress = () => {
    navigation.navigate('ProductDetails', { product });
  };

  const formattedPrice = Number(product.price || 0).toLocaleString('en-IN');

  return (
    <TouchableOpacity
      style={styles.card}
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

        {hasValidImage && (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {hasValidImage && !imageLoaded && (
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
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={1}>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    flex: 1,
    height: 240,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    height: 130, // approximately 54% of 240
    width: '100%',
    position: 'relative',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
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
    top: 8,
    left: 8,
    backgroundColor: 'rgba(10, 30, 106, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoContainer: {
    padding: 10, // slightly tighter padding to fit the larger image and 2-line title
    flex: 1,
    justifyContent: 'space-between',
  },
  titleWrapper: {
    marginBottom: 0,
  },
  name: {
    fontSize: 14, // reduce slightly to accommodate 2 lines gracefully
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 0,
  },
  brand: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },
  description: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 14,
    marginVertical: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto', // Pinned to bottom
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stockIndicator: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginLeft: 4, // More spacing
  },
  inStock: {
    backgroundColor: '#DEF7EC',
  },
  outOfStock: {
    backgroundColor: '#FDE8E8',
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
  },
  inStockText: {
    color: '#03543F',
  },
  outOfStockText: {
    color: '#9B1C1C',
  },
});

export default ProductCard;
