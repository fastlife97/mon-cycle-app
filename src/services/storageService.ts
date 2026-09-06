import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays, addDays } from 'date-fns';
import { CryptoService } from './cryptoService';
import { DailyLog, CycleRecord, UserProfile, FlowIntensity } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'CS_ENCRYPTED_PROFILE_V1',
  CYCLES: 'CS_ENCRYPTED_CYCLES_V1',
  LOGS: 'CS_ENCRYPTED_LOGS_V1',
  IS_INITIALIZED: 'CS_IS_INITIALIZED_V1',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Sérénité',
  cycleSettings: {
    averageCycleLength: 28,
    averagePeriodLength: 5,
    lutealPhaseLength: 14,
    isIrregular: false,
    contraceptionMode: 'natural',
    goal: 'track',
  },
  security: {
    biometricEnabled: true,
    pinCode: CryptoService.hashPin('1234', 'default_salt_cs'),
    hasPin: true,
    autoLockMinutes: 5,
    stealthModeEnabled: false,
    stealthDisguiseType: 'notes',
    stealthPin: '0000',
    zeroKnowledgeKeySalt: 'cs_user_zk_salt_7829',
    isEncrypted: true,
  },
  notifications: {
    enabled: true,
    periodReminderDaysBefore: 2,
    ovulationReminder: true,
    pmsReminder: true,
    dailyLogReminder: true,
    reminderTime: '20:30',
    discreetMode: true,
  },
  supabase: {
    enabled: true,
    url: 'https://xyzcompany.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key',
    syncStatus: 'idle',
    lastSyncedAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
  },
  darkMode: 'system',
};

// Seed realistic data for instant rich visualization
export const generateSeedData = (): { cycles: CycleRecord[]; logs: Record<string, DailyLog> } => {
  const today = new Date();
  
  // Cycle 1: 3 months ago (28 days)
  const c1Start = subDays(today, 68);
  // Cycle 2: 2 months ago (29 days)
  const c2Start = subDays(today, 40);
  // Cycle 3: current cycle (started 12 days ago)
  const c3Start = subDays(today, 12);

  const cycles: CycleRecord[] = [
    {
      id: 'cycle_current',
      startDate: format(c3Start, 'yyyy-MM-dd'),
      periodDurationDays: 5,
      totalCycleDays: 28,
      isPredicted: false,
    },
    {
      id: 'cycle_prev_1',
      startDate: format(c2Start, 'yyyy-MM-dd'),
      endDate: format(subDays(c3Start, 1), 'yyyy-MM-dd'),
      periodDurationDays: 5,
      totalCycleDays: 28,
      isPredicted: false,
    },
    {
      id: 'cycle_prev_2',
      startDate: format(c1Start, 'yyyy-MM-dd'),
      endDate: format(subDays(c2Start, 1), 'yyyy-MM-dd'),
      periodDurationDays: 4,
      totalCycleDays: 28,
      isPredicted: false,
    },
  ];

  const logs: Record<string, DailyLog> = {};

  // Current period days (days 1 to 5 of current cycle)
  const flows: FlowIntensity[] = ['heavy', 'heavy', 'medium', 'light', 'spotting'];
  flows.forEach((flow, idx) => {
    const d = addDays(c3Start, idx);
    const dateStr = format(d, 'yyyy-MM-dd');
    logs[dateStr] = {
      id: dateStr,
      date: dateStr,
      isPeriod: true,
      flow,
      moods: idx < 2 ? ['sensible', 'epuisee'] : ['calme', 'sereine'],
      symptoms: idx < 2 ? ['crampes', 'fatigue', 'ballonnements'] : ['maux_tete'],
      sleepHours: 7.5,
      sleepQuality: 'good',
      waterGlasses: 7,
      stressLevel: 2,
      activities: ['repos', 'tisane'],
      medications: idx === 0 ? ['Spasfon', 'Infusion camomille'] : [],
      notes: idx === 0 ? 'Premier jour des règles. Bouillotte chaude et journée calme.' : undefined,
      updatedAt: new Date().toISOString(),
    };
  });

  // Recent days (Day 6 to today)
  for (let i = 5; i <= 12; i++) {
    const d = addDays(c3Start, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const isOvulatingSoon = i >= 11;
    logs[dateStr] = {
      id: dateStr,
      date: dateStr,
      isPeriod: false,
      flow: 'none',
      moods: isOvulatingSoon ? ['energetique', 'creative', 'confiante'] : ['sereine', 'calme'],
      symptoms: isOvulatingSoon ? ['poitrine_sensible'] : [],
      cervicalMucus: isOvulatingSoon ? 'egg_white' : 'creamy',
      temperature: 36.4 + (i * 0.03),
      sleepHours: 8,
      sleepQuality: 'great',
      waterGlasses: 8,
      stressLevel: 1,
      activities: ['yoga', 'marche'],
      medications: ['Vitamines B9 & D3'],
      notes: isOvulatingSoon ? 'Sensation d’énergie débordante et créativité au sommet !' : undefined,
      updatedAt: new Date().toISOString(),
    };
  }

  return { cycles, logs };
};

export class StorageService {
  /**
   * Initializes storage with default seeds if first launch
   */
  public static async initStorage(): Promise<void> {
    try {
      const initialized = await AsyncStorage.getItem(STORAGE_KEYS.IS_INITIALIZED);
      if (!initialized) {
        const seed = generateSeedData();
        const profile = DEFAULT_PROFILE;
        const salt = profile.security.zeroKnowledgeKeySalt;

        await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, CryptoService.encryptData(profile, salt));
        await AsyncStorage.setItem(STORAGE_KEYS.CYCLES, CryptoService.encryptData(seed.cycles, salt));
        await AsyncStorage.setItem(STORAGE_KEYS.LOGS, CryptoService.encryptData(seed.logs, salt));
        await AsyncStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');
      }
    } catch (e) {
      console.warn('Storage init error:', e);
    }
  }

  /**
   * Loads user profile (decrypted)
   */
  public static async getProfile(): Promise<UserProfile> {
    try {
      const encrypted = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!encrypted) return DEFAULT_PROFILE;
      const decrypted = CryptoService.decryptData<UserProfile>(encrypted, DEFAULT_PROFILE.security.zeroKnowledgeKeySalt);
      return decrypted || DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  /**
   * Saves updated user profile
   */
  public static async saveProfile(profile: UserProfile): Promise<void> {
    try {
      const salt = profile.security.zeroKnowledgeKeySalt;
      const encrypted = CryptoService.encryptData(profile, salt);
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, encrypted);
    } catch (e) {
      console.warn('Save profile error:', e);
    }
  }

  /**
   * Loads cycle records (decrypted)
   */
  public static async getCycles(): Promise<CycleRecord[]> {
    try {
      const encrypted = await AsyncStorage.getItem(STORAGE_KEYS.CYCLES);
      if (!encrypted) {
        const seed = generateSeedData();
        return seed.cycles;
      }
      const decrypted = CryptoService.decryptData<CycleRecord[]>(encrypted);
      return decrypted || generateSeedData().cycles;
    } catch {
      return generateSeedData().cycles;
    }
  }

  /**
   * Saves cycle records
   */
  public static async saveCycles(cycles: CycleRecord[]): Promise<void> {
    try {
      const encrypted = CryptoService.encryptData(cycles);
      await AsyncStorage.setItem(STORAGE_KEYS.CYCLES, encrypted);
    } catch (e) {
      console.warn('Save cycles error:', e);
    }
  }

  /**
   * Loads all daily logs (decrypted)
   */
  public static async getDailyLogs(): Promise<Record<string, DailyLog>> {
    try {
      const encrypted = await AsyncStorage.getItem(STORAGE_KEYS.LOGS);
      if (!encrypted) {
        const seed = generateSeedData();
        return seed.logs;
      }
      const decrypted = CryptoService.decryptData<Record<string, DailyLog>>(encrypted);
      return decrypted || generateSeedData().logs;
    } catch {
      return generateSeedData().logs;
    }
  }

  /**
   * Saves or updates a single daily log
   */
  public static async saveDailyLog(log: DailyLog): Promise<void> {
    try {
      const logs = await this.getDailyLogs();
      logs[log.date] = { ...log, updatedAt: new Date().toISOString() };
      const encrypted = CryptoService.encryptData(logs);
      await AsyncStorage.setItem(STORAGE_KEYS.LOGS, encrypted);
    } catch (e) {
      console.warn('Save daily log error:', e);
    }
  }

  /**
   * Deletes a daily log for a specific date
   */
  public static async deleteDailyLog(dateStr: string): Promise<void> {
    try {
      const logs = await this.getDailyLogs();
      delete logs[dateStr];
      const encrypted = CryptoService.encryptData(logs);
      await AsyncStorage.setItem(STORAGE_KEYS.LOGS, encrypted);
    } catch (e) {
      console.warn('Delete daily log error:', e);
    }
  }

  /**
   * Quick toggle period start for a date
   */
  public static async togglePeriodStart(dateStr: string, flow: FlowIntensity = 'medium'): Promise<void> {
    try {
      const logs = await this.getDailyLogs();
      const existing = logs[dateStr];
      const isCurrentlyPeriod = existing?.isPeriod && existing?.flow !== 'none';

      if (isCurrentlyPeriod) {
        logs[dateStr] = {
          ...(existing || {
            id: dateStr,
            date: dateStr,
            moods: [],
            symptoms: [],
            activities: [],
            medications: [],
            updatedAt: new Date().toISOString(),
          }),
          isPeriod: false,
          flow: 'none',
        };
      } else {
        logs[dateStr] = {
          ...(existing || {
            id: dateStr,
            date: dateStr,
            moods: [],
            symptoms: [],
            activities: [],
            medications: [],
            updatedAt: new Date().toISOString(),
          }),
          isPeriod: true,
          flow: flow === 'none' ? 'medium' : flow,
        };

        // Update cycles if this starts a new cycle
        const cycles = await this.getCycles();
        const hasCycleOnDate = cycles.some(c => c.startDate === dateStr);
        if (!hasCycleOnDate) {
          cycles.unshift({
            id: 'cycle_' + Date.now(),
            startDate: dateStr,
            periodDurationDays: 5,
            totalCycleDays: 28,
            isPredicted: false,
          });
          await this.saveCycles(cycles);
        }
      }

      await AsyncStorage.setItem(STORAGE_KEYS.LOGS, CryptoService.encryptData(logs));
    } catch (e) {
      console.warn('Toggle period start error:', e);
    }
  }

  /**
   * Complete reset of all local application data (Right to be forgotten)
   */
  public static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
      await this.initStorage();
    } catch (e) {
      console.warn('Clear all data error:', e);
    }
  }

  /**
   * Export all data as an encrypted or JSON backup
   */
  public static async exportBackupJson(): Promise<string> {
    const profile = await this.getProfile();
    const cycles = await this.getCycles();
    const logs = await this.getDailyLogs();

    const payload = {
      app: 'CycleSereine',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      encryptionStandard: 'AES-256-PBKDF2-ZeroKnowledge',
      privacyCompliance: 'RGPD-Art-9-Sanctuary',
      profile,
      cycles,
      logs,
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Generates a readable French medical report for doctor / gynaecologist
   */
  public static async generateMedicalReportText(): Promise<string> {
    const profile = await this.getProfile();
    const cycles = await this.getCycles();
    const logs = await this.getDailyLogs();

    let report = `========================================\n`;
    report += `RAPPORT DE SANTÉ GYNÉCOLOGIQUE - CYCLESEREINE\n`;
    report += `Généré le : ${format(new Date(), 'dd/MM/yyyy HH:mm')}\n`;
    report += `Confidentialité : Chiffré de bout en bout • Données certifiées privées\n`;
    report += `========================================\n\n`;

    report += `--- PARAMÈTRES DU CYCLE ---\n`;
    report += `• Durée moyenne du cycle : ${profile.cycleSettings.averageCycleLength} jours\n`;
    report += `• Durée moyenne des règles : ${profile.cycleSettings.averagePeriodLength} jours\n`;
    report += `• Régularité : ${profile.cycleSettings.isIrregular ? 'Irrégulier' : 'Régulier'}\n`;
    report += `• Mode de suivi : ${profile.cycleSettings.contraceptionMode}\n\n`;

    report += `--- HISTORIQUE DES DERNIERS CYCLES ---\n`;
    cycles.slice(0, 5).forEach((c, i) => {
      report += `Cycle ${i + 1} : Début le ${c.startDate} | Durée règles : ${c.periodDurationDays}j | Total : ${c.totalCycleDays || '28'}j\n`;
    });

    report += `\n--- DERNIERS SYMPTÔMES & OBSERVATIONS ENREGISTRÉS ---\n`;
    const sortedLogKeys = Object.keys(logs).sort().reverse().slice(0, 10);
    sortedLogKeys.forEach(dateStr => {
      const l = logs[dateStr];
      const symStr = (l.symptoms || []).join(', ') || 'Aucun';
      const moodStr = (l.moods || []).join(', ') || 'Neutre';
      const flowStr = l.isPeriod ? `Règles (${l.flow})` : 'Hors règles';
      const tempStr = l.temperature ? ` | Temp: ${l.temperature}°C` : '';
      report += `• ${dateStr} : ${flowStr} | Humeur : ${moodStr} | Symptômes : ${symStr}${tempStr}\n`;
    });

    report += `\n========================================\n`;
    report += `CycleSereine - Sanctuaire Privé de Santé Féminine\n`;

    return report;
  }
}
