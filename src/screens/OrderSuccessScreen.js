import React from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Linking, 
  Alert,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../theme/theme';

const DEALER_NUMBER = '9913238496';

export const OrderSuccessScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderNumber, buyerProfile, totalItems, totalPrice } = route.params;

  // WhatsApp Order Notification Handler
  const handleNotifyWhatsApp = () => {
    const formattedPhone = `91${DEALER_NUMBER}`; // India prefix
    
    const message = `Hello KP Hardware,\n\nA new wholesale order request has been submitted.\n\nOrder Number:\n${orderNumber}\n\nBusiness Name:\n${buyerProfile.businessName}\n\nOwner Name:\n${buyerProfile.ownerName}\n\nMobile:\n${buyerProfile.mobileNumber}\n\nTotal Products:\n${totalItems}\n\nTotal Quantity:\n${buyerProfile.address ? 'See order summary for details' : 'N/A'}\n\nPlease review the order and contact the buyer.\n\nThank you.`;

    const waUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    const webUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(waUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(waUrl);
        } else {
          // Alert requested when WhatsApp app is missing
          Alert.alert('WhatsApp Not Installed', 'WhatsApp is not installed on this device.');
        }
      })
      .catch(() => {
        Alert.alert('WhatsApp Not Installed', 'WhatsApp is not installed on this device.');
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successBadge}>
          <Icon name="checkmark-circle" size={80} color={COLORS.accent} />
        </View>

        <Text style={styles.title}>Order Request Received!</Text>
        <Text style={styles.subtitle}>
          Your wholesale catalog order request has been saved successfully in our system database.
        </Text>

        {/* Confirmation Details Card */}
        <View style={[styles.detailsCard, SHADOWS.subtle]}>
          <View style={styles.detailsRow}>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailsRow}>
            <Text style={styles.label}>Estimated Amount</Text>
            <Text style={styles.value}>₹{totalPrice.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailsRow}>
            <Text style={styles.label}>Business Registered</Text>
            <Text style={styles.value}>{buyerProfile.businessName}</Text>
          </View>
        </View>

        {/* WhatsApp Notification Action */}
        <TouchableOpacity 
          style={[styles.whatsappBtn, SHADOWS.subtle]}
          onPress={handleNotifyWhatsApp}
          activeOpacity={0.8}
        >
          <Icon name="logo-whatsapp" size={22} color={COLORS.white} style={styles.btnIcon} />
          <Text style={styles.whatsappBtnText}>Notify Dealer on WhatsApp</Text>
        </TouchableOpacity>

        {/* Other actions list */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.historyBtn]}
            onPress={() => navigation.navigate('OrderHistory')}
            activeOpacity={0.7}
          >
            <Icon name="receipt-outline" size={18} color={COLORS.primary} style={styles.btnIcon} />
            <Text style={styles.historyBtnText}>View Order History</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.homeBtn]}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <Text style={styles.homeBtnText}>Continue Browsing</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  successBadge: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: SPACING.md,
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  detailsCard: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg, // 16px
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  value: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  // WhatsApp notification
  whatsappBtn: {
    backgroundColor: COLORS.accent, // WhatsApp green accent
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.md,
  },
  whatsappBtnText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 15,
  },
  btnIcon: {
    marginRight: 6,
  },
  // Sub-actions layout
  actionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 0.48,
    height: 46,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  historyBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyBtnText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: 13,
  },
  homeBtn: {
    backgroundColor: COLORS.primary,
  },
  homeBtnText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: 13,
  },
});

export default OrderSuccessScreen;
