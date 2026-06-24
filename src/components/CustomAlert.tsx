import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../theme/theme';

export type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type AlertConfig = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
};

let setGlobalAlert: ((config: AlertConfig | null) => void) | null = null;

export const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
  if (setGlobalAlert) {
    setGlobalAlert({ title, message, buttons });
  } else {
    console.warn('CustomAlert is not mounted');
  }
};

export const CustomAlert = () => {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  useEffect(() => {
    setGlobalAlert = setConfig;
    return () => {
      setGlobalAlert = null;
    };
  }, []);

  if (!config) return null;

  const handlePress = (button?: AlertButton) => {
    setConfig(null);
    if (button && button.onPress) {
      button.onPress();
    }
  };

  const defaultButtons: AlertButton[] = [{ text: 'OK', onPress: () => handlePress() }];
  const buttonsToRender = config.buttons && config.buttons.length > 0 ? config.buttons : defaultButtons;
  const isSuccess = config.title.toLowerCase().includes('success') || config.title.toLowerCase().includes('added');

  return (
    <Modal transparent animationType="fade" visible={!!config} onRequestClose={() => setConfig(null)}>
      <View style={styles.overlay}>
        <View style={[styles.alertBox, SHADOWS.large]}>
          {isSuccess && (
            <Icon 
              name="checkmark-circle" 
              size={48} 
              color={COLORS.primary} 
              style={styles.icon} 
            />
          )}
          <Text style={[styles.title, isSuccess && styles.titleCentered]}>{config.title}</Text>
          {!!config.message && (
            <Text style={[styles.message, isSuccess && styles.messageCentered]}>
              {config.message}
            </Text>
          )}
          
          <View style={[styles.buttonContainer, buttonsToRender.length === 1 && styles.buttonContainerCentered]}>
            {buttonsToRender.map((btn, index) => {
              const isPrimary = btn.style !== 'cancel' && btn.style !== 'destructive';
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    buttonsToRender.length === 1 && styles.singleButton,
                    isPrimary ? styles.primaryButton : styles.cancelButton,
                    buttonsToRender.length > 1 && { flex: 1, marginHorizontal: 5 }
                  ]}
                  onPress={() => handlePress(btn)}
                >
                  <Text 
                    style={[
                      styles.buttonText,
                      isPrimary ? styles.primaryButtonText : styles.cancelButtonText
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {btn.text ? btn.text.toUpperCase() : 'OK'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: width * 0.85,
    backgroundColor: COLORS.white,
    borderRadius: 20, // Increased border radius
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 8, // Reduced spacing
  },
  titleCentered: {
    textAlign: 'center',
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: 16, // Reduced empty space below message
    lineHeight: 22,
  },
  messageCentered: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 8, // Reduced spacing
  },
  buttonContainerCentered: {
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12, // Reduced default padding
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleButton: {
    paddingHorizontal: 32, // Wide padding for single prominent button
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
  },
});

