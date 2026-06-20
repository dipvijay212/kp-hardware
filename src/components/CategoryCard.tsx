import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';

interface CategoryCardProps {
  category: string;
}

const CATEGORY_IMAGES: Record<string, string> = {
  'Tools': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=500&q=80',
  'Electrical': 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&w=500&q=80',
  'Plumbing': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80',
  'Paint': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=500&q=80',
  'Fasteners': 'https://images.unsplash.com/photo-1609148013627-ef3d76e737c0?auto=format&fit=crop&w=500&q=80',
  'Safety Equipment': 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=500&q=80'
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const imageUri = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Tools'];

  const handlePress = () => {
    navigation.navigate('ProductList', { category });
  };

  return (
    <TouchableOpacity 
      style={[styles.card, SHADOWS.subtle]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      {/* Visual Overlay for text legibility */}
      <View style={styles.overlay} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{category}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 120,
    borderRadius: BORDER_RADIUS.lg, // 12px
    overflow: 'hidden',
    backgroundColor: COLORS.cardBackground,
    position: 'relative',
    margin: SPACING.sm,
    flex: 1,
    minWidth: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 27, 92, 0.45)', // Overlay tinted with Navy Blue
  },
  textContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  title: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
