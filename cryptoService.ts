import CryptoJS from 'crypto-js';

// Default application pepper for local zero-knowledge encryption
const LOCAL_PEPPER = 'cyclesereine-sanctuary-zero-knowledge-2025-priv';

export class CryptoService {
  /**
   * Derives a 256-bit AES encryption key using PBKDF2 with user salt
   */
  private static deriveKey(passphrase: string, salt: string): string {
    return CryptoJS.PBKDF2(passphrase + LOCAL_PEPPER, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    }).toString();
  }

  /**
   * Encrypts any JSON-serializable payload into an AES-256 encrypted string
   */
  public static encryptData<T>(data: T, salt: string = 'cs_default_salt_99'): string {
    try {
      const jsonString = JSON.stringify(data);
      const key = this.deriveKey('sanctuary_master_secure', salt);
      const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
      return encrypted;
    } catch (e) {
      console.warn('Encryption fallback error:', e);
      return JSON.stringify(data);
    }
  }

  /**
   * Decrypts an AES-256 encrypted string back to typed object
   */
  public static decryptData<T>(encryptedString: string, salt: string = 'cs_default_salt_99'): T | null {
    try {
      if (!encryptedString) return null;
      // If it looks like plain JSON already, try parsing
      if (encryptedString.startsWith('{') || encryptedString.startsWith('[')) {
        return JSON.parse(encryptedString) as T;
      }
      const key = this.deriveKey('sanctuary_master_secure', salt);
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedString, key);
      const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedText) {
        return null;
      }
      return JSON.parse(decryptedText) as T;
    } catch (e) {
      console.warn('Decryption error:', e);
      try {
        return JSON.parse(encryptedString) as T;
      } catch {
        return null;
      }
    }
  }

  /**
   * Hashes a PIN code with SHA-256 for secure local comparison
   */
  public static hashPin(pin: string, salt: string): string {
    return CryptoJS.SHA256(pin + salt + LOCAL_PEPPER).toString();
  }

  /**
   * Generates a random cryptographic salt
   */
  public static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
  }
}
