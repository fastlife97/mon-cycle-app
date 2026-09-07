export type CyclePhase = 
  | 'menstrual'   // Phase menstruelle (Règles)
  | 'follicular'  // Phase folliculaire (Regain d'énergie)
  | 'ovulation'   // Fenêtre fertile & Ovulation (Pic hormonal)
  | 'luteal'      // Phase lutéale (Nidification, énergie douce)
  | 'pms';        // SPM (Syndrome Prémenstruel)

export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy' | 'very_heavy';

export type MoodType = 
  | 'sereine'
  | 'joyeuse'
  | 'calme'
  | 'sensible'
  | 'irritable'
  | 'anxieuse'
  | 'epuisee'
  | 'energetique'
  | 'creative'
  | 'triste'
  | 'amoureuse'
  | 'confiante';

export type SymptomType =
  | 'crampes'
  | 'maux_tete'
  | 'poitrine_sensible'
  | 'ballonnements'
  | 'fatigue'
  | 'acne'
  | 'lombalgies'
  | 'troubles_digestifs'
  | 'bouffees_chaleur'
  | 'insomnie'
  | 'nausees'
  | 'fringales'
  | 'migraine'
  | 'douleurs_articulaires'
  | 'vertiges';

export type CervicalMucus = 'dry' | 'sticky' | 'creamy' | 'egg_white' | 'watery';

export type SexDrive = 'low' | 'medium' | 'high' | 'none';

export type SelfCareActivity = 'yoga' | 'marche' | 'cardio' | 'repos' | 'meditation' | 'bain_chaud' | 'tisane';

export interface DailyLog {
  id: string; // ISO date format YYYY-MM-DD
  date: string; // YYYY-MM-DD
  isPeriod: boolean;
  flow: FlowIntensity;
  moods: MoodType[];
  symptoms: SymptomType[];
  cervicalMucus?: CervicalMucus;
  temperature?: number; // Basal Body Temperature in °C (e.g., 36.6)
  sleepHours?: number; // 0-14
  sleepQuality?: 'poor' | 'fair' | 'good' | 'great';
  waterGlasses?: number; // 0-12
  stressLevel?: number; // 1-5
  sexDrive?: SexDrive;
  hadIntercourse?: boolean;
  usedProtection?: boolean;
  activities: SelfCareActivity[];
  medications: string[];
  notes?: string; // Zero-knowledge encrypted personal journal
  updatedAt: string;
}

export interface CycleRecord {
  id: string;
  startDate: string; // YYYY-MM-DD (Day 1 of period)
  endDate?: string; // YYYY-MM-DD (Last day of cycle)
  periodDurationDays: number; // e.g. 5
  totalCycleDays?: number; // e.g. 28
  isPredicted?: boolean;
}

export interface CycleSettings {
  averageCycleLength: number; // default: 28
  averagePeriodLength: number; // default: 5
  lutealPhaseLength: number; // default: 14
  isIrregular: boolean;
  contraceptionMode: 'natural' | 'pill' | 'iud_copper' | 'iud_hormonal' | 'implant' | 'other';
  goal: 'track' | 'avoid_pregnancy' | 'try_to_conceive';
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  pinCode: string; // Hashed or encrypted 4-6 digit PIN
  hasPin: boolean;
  autoLockMinutes: number; // 0 (immediately), 1, 5, 15
  stealthModeEnabled: boolean;
  stealthDisguiseType: 'notes' | 'calculator' | 'botanical';
  stealthPin?: string; // entering this PIN unlocks fake disguise interface
  zeroKnowledgeKeySalt: string;
  isEncrypted: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  periodReminderDaysBefore: number; // 1, 2, or 3 days
  ovulationReminder: boolean;
  pmsReminder: boolean;
  dailyLogReminder: boolean;
  reminderTime: string; // "20:00"
  discreetMode: boolean; // if true, notifications say "Moment douceur" instead of "Vos règles arrivent"
}

export interface SupabaseSyncSettings {
  enabled: boolean;
  url: string;
  anonKey: string;
  lastSyncedAt?: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

export interface UserProfile {
  name: string;
  cycleSettings: CycleSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  supabase: SupabaseSyncSettings;
  darkMode: 'system' | 'light' | 'dark';
}
