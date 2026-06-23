import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity, Linking, Share, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from '../components/Header';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';

const SHOP_INFO = {
  name: 'KP Hardware Store',
  subtitle: 'Authorized Hardware & Industrial Tools Dealer',
  address: 'KP Hardware, Ground Floor, Sai Complex, Main Market Road, Pune, Maharashtra - 411001',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'orders@kphardware.com',
  timings: '09:00 AM - 08:30 PM (Sunday Closed)',
  about: 'Established in 2010, KP Hardware is a premier business-to-business and local retail catalog supplier of construction tools, electrical supplies, PVC pipes, safety wear, premium paints, and industrial fasteners. We cater directly to building contractors, electricians, plumbers, painters, and residential owners with a guarantee of wholesale pricing and genuine products.'
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [buyerProfile, setBuyerProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('@buyer_profile');
        if (storedProfile) {
          setBuyerProfile(JSON.parse(storedProfile));
        }
      } catch (err) {
        console.error('Error fetching buyer profile', err);
      }
    };
    
    // Subscribe to focus to reload profile when navigating back
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });

    fetchProfile();
    return unsubscribe;
  }, [navigation]);

  const handleCall = () => {
    const telUrl = `tel:${SHOP_INFO.phone.replace(/\\s+/g, '')}`;
    Linking.openURL(telUrl).catch(() => {
      Alert.alert('Error', 'Failed to launch dialer.');
    });
  };

  const handleWhatsApp = () => {
    const msg = `Hello KP Hardware, I am inquiring about products in your catalog.`;
    const waUrl = `whatsapp://send?phone=${SHOP_INFO.whatsapp.replace(/\\s+/g, '')}&text=${encodeURIComponent(msg)}`;
    const webUrl = `https://wa.me/${SHOP_INFO.whatsapp.replace(/[\\s+]+/g, '')}?text=${encodeURIComponent(msg)}`;
    
    Linking.canOpenURL(waUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(waUrl);
        } else {
          Linking.openURL(webUrl);
        }
      })
      .catch(() => {
        Linking.openURL(webUrl);
      });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out KP Hardware Catalog application! Get authentic Tools, Paints, Electrical, Plumbing, and Safety items at wholesale prices.\\nAddress: ${SHOP_INFO.address}\\nContact: ${SHOP_INFO.phone}`,
      });
    } catch (error) {
      console.error('Error sharing catalog', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <Header title="Store Information" showBackButton={false} showCart={true} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Customer Profile Banner */}
        {buyerProfile ? (
          <View style={[styles.profileHeaderCard, SHADOWS.medium, { borderColor: COLORS.primary }]}>
            <View style={styles.avatarCircle}>
              <Icon name="person" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.storeName}>{buyerProfile.businessName}</Text>
            <Text style={[styles.storeSubtitle, { color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weights.semibold }]}>
              {buyerProfile.ownerName}
            </Text>
            
            <View style={{ width: '100%', marginTop: SPACING.md }}>
              <View style={styles.customerDetailRow}>
                <Icon name="call-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.customerDetailText}>{buyerProfile.mobileNumber}</Text>
              </View>
              {buyerProfile.gstNumber ? (
                <View style={styles.customerDetailRow}>
                  <Icon name="document-text-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.customerDetailText}>GST: {buyerProfile.gstNumber}</Text>
                </View>
              ) : null}
              <View style={styles.customerDetailRow}>
                <Icon name="location-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.customerDetailText}>{buyerProfile.address}</Text>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.profileHeaderCard, SHADOWS.medium, { backgroundColor: COLORS.secondary, padding: SPACING.xl }]} 
            onPress={() => navigation.navigate('BuyerInformation')}
            activeOpacity={0.8}
          >
            <Icon name="person-add-outline" size={40} color={COLORS.primary} style={{ marginBottom: SPACING.sm }} />
            <Text style={styles.storeName}>Not Registered</Text>
            <Text style={styles.storeSubtitle}>Tap here to register your wholesale profile to place orders.</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionHeading}>Dealer Information</Text>

        {/* Store Banner Card */}
        <View style={[styles.profileHeaderCard, SHADOWS.medium]}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.storeName}>{SHOP_INFO.name}</Text>
          <Text style={styles.storeSubtitle}>{SHOP_INFO.subtitle}</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]} onPress={handleCall}>
              <Icon name="call" size={18} color={COLORS.white} />
              <Text style={styles.actionBtnText}>Call Store</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.whatsappGreen }]} onPress={handleWhatsApp}>
              <Icon name="logo-whatsapp" size={18} color={COLORS.white} />
              <Text style={styles.actionBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info Card */}
        <View style={[styles.infoCard, SHADOWS.subtle]}>
          <Text style={styles.cardTitle}>Contact Details</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Icon name="location" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{SHOP_INFO.address}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Icon name="call" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{SHOP_INFO.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Icon name="logo-whatsapp" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>WhatsApp Orders</Text>
              <Text style={styles.infoValue}>{SHOP_INFO.whatsapp}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Icon name="mail" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{SHOP_INFO.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Icon name="time" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Timings</Text>
              <Text style={styles.infoValue}>{SHOP_INFO.timings}</Text>
            </View>
          </View>
        </View>

        {/* About Us Card */}
        <View style={[styles.infoCard, SHADOWS.subtle]}>
          <Text style={styles.cardTitle}>About Us</Text>
          <Text style={styles.aboutText}>{SHOP_INFO.about}</Text>
        </View>

        {/* Share Section */}
        <TouchableOpacity style={[styles.shareCard, SHADOWS.subtle]} onPress={handleShare} activeOpacity={0.8}>
          <View style={styles.shareLeft}>
            <Icon name="share-social-outline" size={24} color={COLORS.primary} />
            <Text style={styles.shareText}>Share Catalog App</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Firebase Test Section */}
        <TouchableOpacity style={[styles.shareCard, SHADOWS.subtle]} onPress={() => navigation.navigate('FirebaseTest')} activeOpacity={0.8}>
          <View style={styles.shareLeft}>
            <Icon name="cloud-done-outline" size={24} color={COLORS.primary} />
            <Text style={styles.shareText}>Test Firebase Integration</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Footnote */}
        <Text style={styles.versionText}>KP Hardware Catalog v1.0.0 (Android CLI Edition)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg, // 12px
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logo: {
    width: 120,
    height: 50,
    marginBottom: SPACING.sm,
  },
  storeName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  storeSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flex: 0.45,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginLeft: 6,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg, // 12px
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 2,
    lineHeight: 18,
  },
  aboutText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  shareCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg, // 12px
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  shareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  sectionHeading: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  customerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerDetailText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
});
export default ProfileScreen;
