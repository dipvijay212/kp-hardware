import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  showSearch?: boolean;
  showCart?: boolean;
  showBackButton?: boolean;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showLogo = false,
  showSearch = false,
  showCart = true,
  showBackButton = false,
  style
}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { totalItems } = useCart();

  return (
    <View style={[styles.container, SHADOWS.subtle, style]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        
        {showLogo && (
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => {
              try {
                navigation.navigate('FirebaseTest');
              } catch (e) {
                console.log('FirebaseTest screen not found in navigator', e);
              }
            }}
          >
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
        )}

        {!showLogo && title && (
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        )}
      </View>

      {showSearch && (
        <TouchableOpacity 
          style={styles.searchBar} 
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.8}
        >
          <Icon name="search-outline" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
          <Text style={styles.searchText} numberOfLines={1}>Search name, brand...</Text>
        </TouchableOpacity>
      )}

      {showCart && (
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.7}
        >
          <Icon name="cart-outline" size={26} color={COLORS.primary} />
          {totalItems > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {totalItems > 99 ? '99+' : totalItems}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  backButton: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
  },
  logo: {
    width: 90,
    height: 40,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 38,
    marginHorizontal: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  cartButton: {
    padding: SPACING.xs,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger, // Red badge
    borderRadius: BORDER_RADIUS.round,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
});

export default Header;
