import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Header } from '../components/Header';
import {
  CycleHistoryBarChart,
  SymptomsFrequencyChart,
  MoodDistributionChart,
  TemperatureTrendChart,
} from '../components/ChartComponents';
import { CycleCalculator } from '../services/cycleCalculator';
import { StorageService } from '../services/storageService';
import { CycleRecord, DailyLog } from '../types';
import { Colors, Shadows } from '../constants/theme';

interface HistoryChartScreenProps {
  cycles: CycleRecord[];
  dailyLogs: Record<string, DailyLog>;
  onLockApp: () => void;
  onEnterStealth: () => void;
  isDark?: boolean;
}

export const HistoryChartScreen: React.FC<HistoryChartScreenProps> = ({
  cycles,
  dailyLogs,
  onLockApp,
  onEnterStealth,
  isDark = false,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [reportText, setReportText] = useState<string>('');

  const stats = CycleCalculator.getCycleStatistics(cycles, dailyLogs);

  const handleGenerateReport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const text = await StorageService.generateMedicalReportText();
    setReportText(text);
    setReportModalVisible(true);
  };

  const handleCopyReport = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Rapport Prêt !',
      'Le rapport de santé gynécologique chiffré est prêt à être partagé avec votre praticien.',
      [{ text: 'Parfait' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Historique & Graphiques"
        subtitle="Analyses prédictives & tendances"
        showLock
        showStealth
        onLockPress={onLockApp}
        onStealthPress={onEnterStealth}
        isDark={isDark}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Summary Stat Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.periodLight }]}>
              <Ionicons name="repeat" size={18} color={colors.period} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.avgCycleLength} j</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cycle Moyen</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="water" size={18} color="#EF4444" />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.avgPeriodDuration} j</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Règles Moyennes</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="shield-checkmark" size={18} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: '#059669', fontSize: 13, fontWeight: '800' }]}>
              {stats.regularityStatus}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Régularité</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="calendar" size={18} color={colors.accent} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.totalTrackedCycles}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cycles Suivis</Text>
          </View>
        </View>

        {/* 1. Cycle History Bar Chart */}
        <CycleHistoryBarChart cycles={cycles} avgCycleLength={stats.avgCycleLength} isDark={isDark} />

        {/* 2. Symptoms Frequency */}
        <SymptomsFrequencyChart logs={dailyLogs} isDark={isDark} />

        {/* 3. Mood Landscape */}
        <MoodDistributionChart logs={dailyLogs} isDark={isDark} />

        {/* 4. Basal Temperature Curve */}
        <TemperatureTrendChart logs={dailyLogs} isDark={isDark} />

        {/* Medical Export Section */}
        <View style={[styles.exportCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
          <View style={styles.exportHeader}>
            <Ionicons name="medical" size={20} color={colors.period} />
            <Text style={[styles.exportTitle, { color: colors.textPrimary }]}>
              Rapport pour Médecin / Sage-Femme
            </Text>
          </View>
          <Text style={[styles.exportDesc, { color: colors.textSecondary }]}>
            Générez un récapitulatif clair et confidentiel de vos cycles et symptômes pour faciliter vos échanges lors de vos consultations de santé.
          </Text>

          <TouchableOpacity
            style={[styles.exportBtn, { backgroundColor: colors.accent }]}
            onPress={handleGenerateReport}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
            <Text style={styles.exportBtnText}>Générer le rapport de consultation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Report Modal */}
      <Modal visible={reportModalVisible} animationType="slide" transparent={false}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
            <View style={styles.modalHeaderLeft}>
              <Ionicons name="document-text" size={20} color={colors.period} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Rapport Gynécologique
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReportModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.reportScroll} contentContainerStyle={styles.reportContent}>
            <View style={[styles.reportPaper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.reportMonospace, { color: colors.textPrimary }]}>{reportText}</Text>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
            <TouchableOpacity
              style={[styles.copyBtn, { backgroundColor: colors.accent }]}
              onPress={handleCopyReport}
            >
              <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
              <Text style={styles.copyBtnText}>Copier le rapport confidentiel</Text>
            </TouchableOpacity>
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
    paddingBottom: 40,
    gap: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 10,
  },
  statCard: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  exportCard: {
    marginHorizontal: 18,
    marginVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  exportDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 44,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  reportScroll: {
    flex: 1,
  },
  reportContent: {
    padding: 16,
  },
  reportPaper: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  reportMonospace: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
