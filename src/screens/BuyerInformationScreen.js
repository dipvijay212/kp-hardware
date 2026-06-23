import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { registerBuyer } from '../services/orderService';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../theme/theme';

export const BuyerInformationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Checking if there is a target redirect screen (e.g. 'OrderRequest')
  const redirectTo = route.params?.redirectTo || null;

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Basic validation checks
    if (!businessName.trim()) return Alert.alert('Validation Error', 'Please enter your Business Name.');
    if (!ownerName.trim()) return Alert.alert('Validation Error', 'Please enter the Owner\'s Name.');
    if (!mobileNumber.trim()) return Alert.alert('Validation Error', 'Please enter your Mobile Number.');
    if (mobileNumber.trim().length < 10) return Alert.alert('Validation Error', 'Mobile Number must be at least 10 digits.');
    if (!address.trim()) return Alert.alert('Validation Error', 'Please enter your Delivery Address.');

    const buyerData = {
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      mobileNumber: mobileNumber.trim(),
      gstNumber: gstNumber.trim(),
      address: address.trim(),
    };

    setLoading(true);
    try {
      // 1. Save to Firestore 'buyers' collection
      const buyerId = await registerBuyer(buyerData);
      
      const buyerProfile = {
        id: buyerId,
        ...buyerData
      };

      // 2. Persist buyer credentials locally in AsyncStorage
      await AsyncStorage.setItem('@buyer_profile', JSON.stringify(buyerProfile));
      
      Alert.alert('Registration Successful', 'Welcome to KP Hardware Wholesales!', [
        {
          text: 'Proceed',
          onPress: () => {
            if (redirectTo) {
              navigation.replace(redirectTo);
            } else {
              navigation.navigate('Home');
            }
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'Unable to connect to database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <Header title="Wholesale Registration" showBackButton={true} showCart={false} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.welcomeCard}>
            <View style={styles.iconCircle}>
              <Icon name="business" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Wholesale Buyer Registration</Text>
            <Text style={styles.welcomeSubtitle}>
              Please enter your business credentials to request wholesale catalog price summaries and submit orders.
            </Text>
          </View>

          <View style={[styles.formCard, SHADOWS.subtle]}>
            {/* Business Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Shiv Shakti Enterprises"
                placeholderTextColor={COLORS.textLight}
                value={businessName}
                onChangeText={setBusinessName}
              />
            </View>

            {/* Owner Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Owner Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={COLORS.textLight}
                value={ownerName}
                onChangeText={setOwnerName}
              />
            </View>

            {/* Mobile Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile / Contact Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 9913238496"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
                maxLength={10}
                value={mobileNumber}
                onChangeText={setMobileNumber}
              />
            </View>

            {/* GST Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>GST Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 27AAAAA1111A1Z1"
                placeholderTextColor={COLORS.textLight}
                autoCapitalize="characters"
                value={gstNumber}
                onChangeText={setGstNumber}
              />
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Delivery / Business Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter complete shipping address details..."
                placeholderTextColor={COLORS.textLight}
                multiline={true}
                numberOfLines={3}
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.btn, loading && styles.btnDisabled]} 
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Icon name="checkbox-outline" size={20} color={COLORS.white} style={styles.btnIcon} />
                <Text style={styles.btnText}>Register & Proceed</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  welcomeCard: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(10, 30, 106, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg, // 16px
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 46,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.secondary,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  btn: {
    backgroundColor: COLORS.primary, // Navy Blue
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnIcon: {
    marginRight: 6,
  },
  btnText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 15,
  },
});

export default BuyerInformationScreen;
