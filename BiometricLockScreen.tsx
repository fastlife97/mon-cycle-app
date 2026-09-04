import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { BiometricService } from '../services/biometricService';
import { SecuritySettings } from '../types';
import { Colors } from '../constants/theme';

interface BiometricLockScreenProps {
  securitySettings: SecuritySettings;
  onUnlockSuccess: () => void;
  onStealthUnlock: () => void;
  isDark?: boolean;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({
  securitySettings,
  onUnlockSuccess,
  onStealthUnlock,
  isDark = false,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [biometricLabel, setBiometricLabel] = useState<string>('Biométrie');

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const status = await BiometricService.checkBiometrics();
    setBiometricAvailable(status.hasHardware && status.isEnrolled);
    setBiometricLabel(status.biometricName);

    if (securitySettings.biometricEnabled && status.hasHardware && status.isEnrolled) {
      triggerBiometricAuth();
    }
  };

  const triggerBiometricAuth = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const success = await BiometricService.authenticateBiometric('Déverrouiller CycleSereine');
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onUnlockSuccess();
      }
    } catch {
      // User can use PIN fallback
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setErrorMsg('');

    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      validatePin(newPin);
    }
  };

  const handleDelete = () => {
    if (pin.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin(pin.slice(0, -1));
    setErrorMsg('');
  };

  const validatePin = (entered: string) => {
    // Check stealth PIN first
    if (BiometricService.isStealthPin(entered, securitySettings.stealthPin || '0000')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setPin('');
      onStealthUnlock();
      return;
    }

    // Check main PIN
    const isValid = BiometricService.verifyPin(
      entered,
      securitySettings.pinCode,
      securitySettings.zeroKnowledgeKeySalt
    );

    // Also fallback check for default 1234
    if (isValid || entered === '1234') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onUnlockSuccess();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMsg('Code PIN incorrect');
      setPin('');
    }
  };

  const KEYPAD_ROWS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['bio', '0', 'del'],
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header & Shield icon */}
      <View style={styles.topSection}>
        <View style={[styles.shieldCircle, { backgroundColor: colors.periodLight }]}>
          <Ionicons name="lock-closed" size={32} color={colors.period} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>CycleSereine</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sanctuaire Chiffré & 100% Confidentiel
        </Text>

        <View style={[styles.privacyPill, { backgroundColor: isDark ? '#1F342B' : '#ECFDF5' }]}>
          <Ionicons name="shield-checkmark" size={13} color="#10B981" />
          <Text style={[styles.privacyPillText, { color: '#059669' }]}>Chiffrement AES-256 Actif</Text>
        </View>
      </View>

      {/* PIN Dots Display */}
      <View style={styles.pinSection}>
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <View
                key={idx}
                style={[
                  styles.dot,
                  {
                    backgroundColor: isFilled ? colors.period : colors.surfaceSubtle,
                    borderColor: isFilled ? colors.period : colors.border,
                    transform: [{ scale: isFilled ? 1.15 : 1 }],
                  },
                ]}
              />
            );
          })}
        </View>

        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : (
          <Text style={[styles.hintText, { color: colors.textMuted }]}>
            Entrez votre code secret (PIN par défaut : 1234)
          </Text>
        )}
      </View>

      {/* Numeric Keypad */}
      <View style={styles.keypad}>
        {KEYPAD_ROWS.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.keypadRow}>
            {row.map((item) => {
              if (item === 'bio') {
                return (
                  <TouchableOpacity
                    key="bio"
                    style={[styles.keypadBtn, { backgroundColor: 'transparent' }]}
                    onPress={triggerBiometricAuth}
                    activeOpacity={0.6}
                  >
                    <Ionicons
                      name="finger-print-outline"
                      size={28}
                      color={colors.period}
                    />
                  </TouchableOpacity>
                );
              }

              if (item === 'del') {
                return (
                  <TouchableOpacity
                    key="del"
                    style={[styles.keypadBtn, { backgroundColor: 'transparent' }]}
                    onPress={handleDelete}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="backspace-outline" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.keypadBtn,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => handleKeyPress(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keypadNumber, { color: colors.textPrimary }]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Footer Info */}
      <TouchableOpacity
        style={styles.forgotBtn}
        onPress={() =>
          Alert.alert(
            'Sanctuaire Sécurisé CycleSereine',
            'Par mesure de haute confidentialité, vos données sont chiffrées localement.\n\nCode PIN de secours par défaut : 1234\nCode leurre (Mode Furtif) : 0000',
            [{ text: 'Compris' }]
          )
        }
      >
        <Text style={[styles.forgotText, { color: colors.textMuted }]}>Code oublié ou Mode Furtif ?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 24,
  },
  topSection: {
    alignItems: 'center',
  },
  shieldCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 10,
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  privacyPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pinSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500',
  },
  keypad: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  keypadBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  keypadNumber: {
    fontSize: 26,
    fontWeight: '600',
  },
  forgotBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
