import * as LocalAuthentication from 'expo-local-authentication';
import { CryptoService } from './cryptoService';

export interface BiometricStatus {
  hasHardware: boolean;
  isEnrolled: boolean;
  biometricTypes: LocalAuthentication.AuthenticationType[];
  biometricName: string; // e.g. "Face ID", "Touch ID", "Empreinte digitale", "Biométrie"
}

export class BiometricService {
  /**
   * Check if biometrics are supported and enrolled on the device
   */
  public static async checkBiometrics(): Promise<BiometricStatus> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricName = 'Biométrie';
      if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricName = 'Face ID / Reconnaissance faciale';
      } else if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricName = 'Touch ID / Empreinte';
      }

      return {
        hasHardware,
        isEnrolled,
        biometricTypes,
        biometricName,
      };
    } catch (e) {
      console.warn('Biometrics check error:', e);
      return {
        hasHardware: false,
        isEnrolled: false,
        biometricTypes: [],
        biometricName: 'Biométrie',
      };
    }
  }

  /**
   * Prompt biometric authentication with French prompt
   */
  public static async authenticateBiometric(reason: string = 'Déverrouillez votre sanctuaire CycleSereine'): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Utiliser le code PIN',
        fallbackLabel: 'Code secret',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (e) {
      console.warn('Biometric auth failed:', e);
      return false;
    }
  }

  /**
   * Verify entered PIN against stored hashed PIN
   */
  public static verifyPin(enteredPin: string, storedHashedPin: string, salt: string): boolean {
    if (!enteredPin || !storedHashedPin) return false;
    const computedHash = CryptoService.hashPin(enteredPin, salt);
    return computedHash === storedHashedPin;
  }

  /**
   * Check if entered PIN matches Stealth/Disguise PIN
   */
  public static isStealthPin(enteredPin: string, storedStealthPin?: string): boolean {
    if (!storedStealthPin || !enteredPin) return false;
    return enteredPin.trim() === storedStealthPin.trim();
  }
}
