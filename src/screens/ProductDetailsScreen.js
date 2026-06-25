import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ScrollView, 
  Image, 
  StatusBar, 
  TouchableOpacity, 
  Linking, 
  Platform,
  Dimensions,
  Share,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../theme/theme';
import { useCart } from '../context/CartContext';
import { showAlert } from '../components/CustomAlert';

const { width } = Dimensions.get('window');

// Dealer Contact details
const DEALER_NUMBER = '9913238496';

export const ProductDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params;
  const [imageError, setImageError] = useState(false);
  
  // Cart Actions Integration
  const { addToCart } = useCart();

  const hasValidImage = product.image && !imageError;

  // Add to Cart Action
  const handleAddToCart = () => {
    addToCart(product, 1);
    showAlert('Added to Cart', `${product.name} has been added to your wholesale cart successfully.`);
  };

  // 1. Call Dealer Handler
  const handleCall = () => {
    const telUrl = `tel:${DEALER_NUMBER}`;
    Linking.canOpenURL(telUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(telUrl);
        } else {
          showAlert('Call Failed', 'Unable to make a phone call.');
        }
      })
      .catch(() => {
        showAlert('Call Failed', 'Unable to make a phone call.');
      });
  };

  // 2. WhatsApp Inquiry Handler
  const handleWhatsApp = () => {
    const formattedPhone = `91${DEALER_NUMBER}`; // India country code prefix
    
    // Custom pre-filled message format
    const message = `Hello KP Hardware,\n\nI am interested in the following product:\n\nProduct Name: ${product.name}\nBrand: ${product.brand || 'N/A'}\nCategory: ${product.category}\nPrice: ₹${Number(product.price).toLocaleString('en-IN')}\n\nPlease share availability and more details.\n\nThank you.`;
    
    const waUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    const webUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(waUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(waUrl);
        } else {
          // If WhatsApp app is not installed, show the requested alert
          showAlert('WhatsApp Not Installed', 'WhatsApp is not installed on this device.');
        }
      })
      .catch(() => {
        showAlert('WhatsApp Not Installed', 'WhatsApp is not installed on this device.');
      });
  };

  // 3. Share Product Handler
  const handleShare = async () => {
    try {
      const shareMessage = `Check out this product on KP Hardware Catalog:\n\nProduct Name: ${product.name}\nBrand: ${product.brand || 'N/A'}\nCategory: ${product.category}\nPrice: ₹${Number(product.price).toLocaleString('en-IN')}\nDescription: ${product.description || 'Professional-grade hardware equipment.'}`;
      
      await Share.share({
        message: shareMessage,
        title: product.name,
      });
    } catch (error) {
      console.error('Error sharing product details:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      {/* Header bar */}
      <Header title="Product Details" showBackButton={true} showCart={true} />

      <View style={styles.contentWrapper}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {/* Large Image Banner */}
          <View style={styles.imageContainer}>

            {hasValidImage && (
              <Image
                source={{ uri: product.image }}
                style={styles.image}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
            )}
          </View>

          {/* Product Details Card Sheet */}
          <View style={styles.detailsContainer}>
            <Text style={styles.name}>{product.name}</Text>
          </View>
        </ScrollView>

        {/* Sticky Bottom Action Buttons */}
        <View style={styles.stickyFooter}>
          {/* Row 1: Add to Cart Button (Primary wholesale flow) */}
          <TouchableOpacity 
            style={styles.addToCartBtn} 
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Icon name="cart-outline" size={20} color={COLORS.white} style={styles.btnIcon} />
            <Text style={styles.addToCartText}>Add To Cart</Text>
          </TouchableOpacity>

          {/* Row 2: Secondary buttons */}
          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity 
              style={styles.shareBtn} 
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Icon name="share-social" size={22} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.callBtn]} 
              onPress={handleCall}
              activeOpacity={0.85}
            >
              <Icon name="call" size={18} color={COLORS.white} style={styles.btnIcon} />
              <Text style={styles.btnText}>Call Dealer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.whatsappBtn]} 
              onPress={handleWhatsApp}
              activeOpacity={0.85}
            >
              <Icon name="logo-whatsapp" size={20} color={COLORS.white} style={styles.btnIcon} />
              <Text style={styles.btnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 155, // Extra space at bottom to scroll past the double-row sticky footer
  },
  imageContainer: {
    width: width,
    height: width, // Make it a perfect square to maximize image size
    backgroundColor: COLORS.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 24,
    paddingTop: 30,
    backgroundColor: COLORS.white,
    alignItems: 'center', // Center the content horizontally
  },
  name: {
    fontSize: 28, // Increase font size to fill space
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    lineHeight: 36,
    textAlign: 'center', // Center the text
    marginBottom: 20,
  },
  // Sticky Footer styling
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'column',
    alignItems: 'stretch',
    // Soft shadow for sticky float
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  addToCartBtn: {
    backgroundColor: COLORS.primary, // Navy Blue
    height: 46,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
    ...SHADOWS.subtle,
  },
  addToCartText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 14,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareBtn: {
    width: 46,
    height: 44,
    borderRadius: BORDER_RADIUS.md, // Rounded buttons matching theme
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    ...SHADOWS.subtle,
  },
  callBtn: {
    backgroundColor: COLORS.primary, // Navy Blue (#0A1E6A)
  },
  whatsappBtn: {
    flex: 1.1, // Give slightly more space to WhatsApp text
    backgroundColor: COLORS.accent, // Vibrant Green Accent (#00C853)
  },
  btnIcon: {
    marginRight: 6,
  },
  btnText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 13,
  },
});

export default ProductDetailsScreen;
