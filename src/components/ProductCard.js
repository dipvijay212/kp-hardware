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

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>

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

      </View>

      <View style={styles.infoContainer}>
        <View style={styles.titleWrapper}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
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
    overflow: 'hidden',
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
    height: 135,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent', // Allow background to show through
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
  infoContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
    justifyContent: 'flex-start',
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
});

export default ProductCard;
