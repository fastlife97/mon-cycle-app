import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Header } from '../components/Header';
import { PrivacyInfoModal } from '../components/PrivacyInfoModal';
import { SupabaseService } from '../services/supabaseService';
import { StorageService } from '../services/storageService';
import { CryptoService } from '../services/cryptoService';
import { UserProfile, CycleRecord, DailyLog } from '../types';
import { Colors, Shadows } from '../constants/theme';

interface SettingsScreenProps {
  profile: UserProfile;
  cycles: CycleRecord[];
  dailyLogs: Record<string, DailyLog>;
  onUpdateProfile: (newProfile: UserProfile) => Promise<void>;
  onResetData: () => Promise<void>;
  onLockApp: () => void;
  onEnterStealth: () => void;
  isDark?: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  cycles,
  dailyLogs,
  onUpdateProfile,
  onResetData,
  onLockApp,
  onEnterStealth,
  isDark = false,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [newStealthPin, setNewStealthPin] = useState(profile.security.stealthPin || '0000');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string>('');

  // Editable fields
  const [cycleLength, setCycleLength] = useState(profile.cycleSettings.averageCycleLength);
  const [periodLength, setPeriodLength] = useState(profile.cycleSettings.averagePeriodLength);
  const [contraception, setContraception] = useState(profile.cycleSettings.contraceptionMode);
  const [biometricEnabled, setBiometricEnabled] = useState(profile.security.biometricEnabled);
  const [stealthEnabled, setStealthEnabled] = useState(profile.security.stealthModeEnabled);
  const [notifEnabled, setNotifEnabled] = useState(profile.notifications.enabled);
  const [discreetNotif, setDiscreetNotif] = useState(profile.notifications.discreetMode);
  const [supabaseUrl, setSupabaseUrl] = useState(profile.supabase.url);
  const [supabaseKey, setSupabaseKey] = useState(profile.supabase.anonKey);

  const saveSettings = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updated: UserProfile = {
      ...profile,
      cycleSettings: {
        ...profile.cycleSettings,
        averageCycleLength: cycleLength,
        averagePeriodLength: periodLength,
        contraceptionMode: contraception,
      },
      security: {
        ...profile.security,
        biometricEnabled,
        stealthModeEnabled: stealthEnabled,
        stealthPin: newStealthPin,
      },
      notifications: {
        ...profile.notifications,
        enabled: notifEnabled,
        discreetMode: discreetNotif,
      },
      supabase: {
        ...profile.supabase,
        url: supabaseUrl,
        anonKey: supabaseKey,
      },
    };

    await onUpdateProfile(updated);
    Alert.alert('Paramètres enregistrés', 'Vos préférences de sécurité et de cycle sont à jour.');
  };

  const handleTestSupabase = async () => {
    setIsSyncing(true);
    setSyncFeedback('Vérification du chiffrement et connexion...');
    const res = await SupabaseService.testConnection(supabaseUrl, supabaseKey);
    setIsSyncing(false);
    setSyncFeedback(res.message);
    Haptics.notificationAsync(
      res.success
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSyncFeedback('Chiffrement local AES-256 en cours...');
    const payload = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      profile,
      cycles,
      logs: dailyLogs,
    };
    const res = await SupabaseService.backupEncrypted(
      payload,
      profile.security.zeroKnowledgeKeySalt,
      supabaseUrl,
      supabaseKey
    );
    setIsSyncing(false);
    setSyncFeedback(res.message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleChangePin = async () => {
    if (newPin.length !== 4) {
      Alert.alert('Code invalide', 'Le code PIN doit comporter 4 chiffres.');
      return;
    }
    const hashed = CryptoService.hashPin(newPin, profile.security.zeroKnowledgeKeySalt);
    const updated: UserProfile = {
      ...profile,
      security: {
        ...profile.security,
        pinCode: hashed,
        hasPin: true,
      },
    };
    await onUpdateProfile(updated);
    setShowPinChangeModal(false);
    setNewPin('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Code PIN modifié', 'Votre nouveau code PIN est enregistré.');
  };

  const handleExportData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const json = await StorageService.exportBackupJson();
    Alert.alert(
      'Exportation Réussie (JSON Chiffré)',
      `Votre sauvegarde comprend ${cycles.length} cycles et ${Object.keys(dailyLogs).length} jours de journal intime.`,
      [{ text: 'OK' }]
    );
  };

  const handleResetConfirm = () => {
    Alert.alert(
      'Effacer définitivement vos données ?',
      'Cette action supprimera tous vos cycles et journaux intimes locaux conformément au droit à l’oubli.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await onResetData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Données réinitialisées', 'Votre sanctuaire est désormais vierge.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Paramètres & Sécurité"
        subtitle="Confidentialité, biométrie & cycle"
        showLock
        showStealth
        onLockPress={onLockApp}
        onStealthPress={onEnterStealth}
        isDark={isDark}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Security & Sanctuary Top Card */}
        <TouchableOpacity
          style={[
            styles.privacyHero,
            { backgroundColor: isDark ? '#1C3127' : '#ECFDF5', borderColor: isDark ? '#234C3C' : '#A7F3D0' },
          ]}
          onPress={() => setShowPrivacyModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.privacyHeroLeft}>
            <Ionicons name="shield-checkmark" size={24} color="#059669" />
            <View>
              <Text style={[styles.privacyHeroTitle, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
                Sanctuaire de Confidentialité
              </Text>
              <Text style={[styles.privacyHeroSub, { color: isDark ? '#6EE7B7' : '#047857' }]}>
                Chiffrement AES-256 • Zéro traceur • 100% Privé
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#059669" />
        </TouchableOpacity>

        {/* 1. Security & Biometrics */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
          <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
            🔒 Sécurité & Verrouillage
          </Text>

          {/* Biometrics Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Face ID / Empreinte
              </Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                Déverrouillez instantanément
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>

          {/* Change PIN button */}
          <TouchableOpacity
            style={[styles.actionRowBtn, { borderColor: colors.borderLight }]}
            onPress={() => setShowPinChangeModal(true)}
          >
            <View style={styles.actionRowLeft}>
              <Ionicons name="key-outline" size={18} color={colors.textPrimary} />
              <Text style={[styles.actionRowText, { color: colors.textPrimary }]}>
                Modifier mon code PIN (4 chiffres)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Stealth Mode Switch */}
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 12 }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Mode Furtif & Déguisement
              </Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                Transforme l'appli en bloc-notes anodin
              </Text>
            </View>
            <Switch
              value={stealthEnabled}
              onValueChange={setStealthEnabled}
              trackColor={{ false: colors.border, true: '#2A9D8F' }}
            />
          </View>

          {/* Stealth PIN info */}
          <View style={styles.stealthPinRow}>
            <Text style={[styles.settingSub, { color: colors.textSecondary, flex: 1 }]}>
              Code PIN leurre (ouvre le faux bloc-notes) :
            </Text>
            <TextInput
              style={[styles.pinSmallInput, { backgroundColor: colors.surfaceSubtle, color: colors.textPrimary }]}
              value={newStealthPin}
              onChangeText={setNewStealthPin}
              maxLength={4}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* 2. Cycle Settings */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
          <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
            🌸 Paramètres du Cycle
          </Text>

          {/* Average Cycle Length */}
          <View style={styles.stepperRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Durée du cycle</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Intervalle moyen entre 2 règles</Text>
            </View>
            <View style={styles.stepperControls}>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: colors.surfaceSubtle }]}
                onPress={() => setCycleLength(Math.max(20, cycleLength - 1))}
              >
                <Ionicons name="remove" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: colors.textPrimary }]}>{cycleLength} j</Text>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: colors.surfaceSubtle }]}
                onPress={() => setCycleLength(Math.min(45, cycleLength + 1))}
              >
                <Ionicons name="add" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Average Period Duration */}
          <View style={styles.stepperRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Durée des règles</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Nombre moyen de jours de saignement</Text>
            </View>
            <View style={styles.stepperControls}>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: colors.surfaceSubtle }]}
                onPress={() => setPeriodLength(Math.max(2, periodLength - 1))}
              >
                <Ionicons name="remove" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: colors.textPrimary }]}>{periodLength} j</Text>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: colors.surfaceSubtle }]}
                onPress={() => setPeriodLength(Math.min(10, periodLength + 1))}
              >
                <Ionicons name="add" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Contraception Mode */}
          <Text style={[styles.settingLabel, { color: colors.textPrimary, marginTop: 10, marginBottom: 8 }]}>
            Mode de contraception
          </Text>
          <View style={styles.contraRow}>
            {[
              { id: 'natural', label: 'Naturel / Écoute' },
              { id: 'pill', label: 'Pilule' },
              { id: 'iud_copper', label: 'DIU Cuivre' },
              { id: 'iud_hormonal', label: 'DIU Hormonal' },
            ].map((item) => {
              const isSelected = contraception === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.contraBtn,
                    {
                      backgroundColor: isSelected ? colors.accentLight : colors.surfaceSubtle,
                      borderColor: isSelected ? colors.accent : 'transparent',
                    },
                  ]}
                  onPress={() => setContraception(item.id as any)}
                >
                  <Text
                    style={[
                      styles.contraBtnText,
                      { color: isSelected ? colors.accent : colors.textPrimary },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Gentle Notifications */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
          <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
            🔔 Rappels Bienveillants
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Activer les notifications
              </Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                Rappels discrets et prévisions douces
              </Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>

          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 12 }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Mode Discret & Poétique
              </Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                Remplace les termes explicites par « Moment douceur »
              </Text>
            </View>
            <Switch
              value={discreetNotif}
              onValueChange={setDiscreetNotif}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>
        </View>

        {/* 4. Supabase Cloud Sync */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
          <View style={styles.supabaseHeader}>
            <Ionicons name="cloud-upload" size={20} color="#38A3A5" />
            <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
              Sauvegarde Cloud Supabase (Chiffrée)
            </Text>
          </View>
          <Text style={[styles.settingSub, { color: colors.textSecondary, marginBottom: 12 }]}>
            Architecture Zero-Knowledge : seules les données chiffrées sont synchronisées. Vous détenez la clé unique de déchiffrement.
          </Text>

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>URL de votre projet Supabase</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surfaceSubtle, color: colors.textPrimary, borderColor: colors.border }]}
            value={supabaseUrl}
            onChangeText={setSupabaseUrl}
            placeholder="https://xyz.supabase.co"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 10 }]}>Clé Publique Anon Key</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surfaceSubtle, color: colors.textPrimary, borderColor: colors.border }]}
            value={supabaseKey}
            onChangeText={setSupabaseKey}
            placeholder="eyJhbGciOi..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            secureTextEntry
          />

          {syncFeedback ? (
            <Text style={[styles.feedbackText, { color: '#059669' }]}>{syncFeedback}</Text>
          ) : null}

          <View style={styles.supabaseBtnRow}>
            <TouchableOpacity
              style={[styles.testBtn, { borderColor: colors.border }]}
              onPress={handleTestSupabase}
              disabled={isSyncing}
            >
              <Text style={[styles.testBtnText, { color: colors.textPrimary }]}>Tester connexion</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.syncBtn, { backgroundColor: '#38A3A5' }]}
              onPress={handleCloudSync}
              disabled={isSyncing}
            >
              <Ionicons name="cloud-done" size={16} color="#FFFFFF" />
              <Text style={styles.syncBtnText}>Synchroniser</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Data Sovereignty & GDPR */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
          <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
            💾 Souveraineté & Données (RGPD)
          </Text>

          <TouchableOpacity style={[styles.actionRowBtn, { borderColor: colors.borderLight }]} onPress={handleExportData}>
            <View style={styles.actionRowLeft}>
              <Ionicons name="download-outline" size={18} color={colors.textPrimary} />
              <Text style={[styles.actionRowText, { color: colors.textPrimary }]}>
                Exporter ma sauvegarde chiffrée (JSON)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionRowBtn, { borderColor: colors.borderLight }]} onPress={handleResetConfirm}>
            <View style={styles.actionRowLeft}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={[styles.actionRowText, { color: '#EF4444' }]}>
                Effacer toutes mes données (Droit à l'oubli)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Save Settings Button */}
        <TouchableOpacity
          style={[styles.saveAllBtn, { backgroundColor: colors.accent, ...Shadows.glow(colors.accent) }]}
          onPress={saveSettings}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.saveAllBtnText}>Enregistrer mes préférences</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Privacy modal */}
      <PrivacyInfoModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        isDark={isDark}
      />

      {/* PIN Change Modal */}
      <Modal visible={showPinChangeModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.pinModalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.pinModalTitle, { color: colors.textPrimary }]}>
              Nouveau Code PIN
            </Text>
            <Text style={[styles.pinModalSub, { color: colors.textSecondary }]}>
              Choisissez un code à 4 chiffres pour sécuriser CycleSereine.
            </Text>

            <TextInput
              style={[
                styles.pinBigInput,
                { backgroundColor: colors.surfaceSubtle, color: colors.textPrimary, borderColor: colors.border },
              ]}
              value={newPin}
              onChangeText={setNewPin}
              maxLength={4}
              keyboardType="number-pad"
              placeholder="••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoFocus
            />

            <View style={styles.pinModalBtnRow}>
              <TouchableOpacity
                style={[styles.pinCancelBtn, { borderColor: colors.border }]}
                onPress={() => setShowPinChangeModal(false)}
              >
                <Text style={[styles.pinCancelBtnText, { color: colors.textSecondary }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pinSaveBtn, { backgroundColor: colors.accent }]} onPress={handleChangePin}>
                <Text style={styles.pinSaveBtnText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  privacyHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  privacyHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  privacyHeroTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  privacyHeroSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 8,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionRowText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stealthPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pinSmallInput: {
    width: 60,
    height: 36,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '800',
    minWidth: 35,
    textAlign: 'center',
  },
  contraRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contraBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  contraBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  supabaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  supabaseBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  testBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  syncBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  saveAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 6,
  },
  saveAllBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  pinModalCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
  },
  pinModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  pinModalSub: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  pinBigInput: {
    width: 140,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 8,
    fontWeight: '800',
    marginBottom: 18,
  },
  pinModalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  pinCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  pinCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pinSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  pinSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
