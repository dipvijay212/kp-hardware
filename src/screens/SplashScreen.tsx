import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StatusBar, Text } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme/theme';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in (1000ms) -> Hold (800ms) -> Fade out (700ms)
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset navigation stack to MainTabs after splash animation complete
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        })
      );
    });
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>KP Hardware Catalog</Text>
        <Text style={styles.subtitle}>Premium Hardware Products Store</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Navy blue background
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: SPACING.md,
    tintColor: COLORS.white, // Tinting the logo white looks incredibly clean on the blue background
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent, // Gold text for title
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
    color: COLORS.white,
    marginTop: SPACING.xs,
    opacity: 0.8,
    textAlign: 'center',
  },
});
