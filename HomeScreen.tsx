import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Header } from '../components/Header';
import { SecurityBadge } from '../components/SecurityBadge';
import { CycleRing } from '../components/CycleRing';
import { CalendarView } from '../components/CalendarView';
import { PhaseInsightCard } from '../components/PhaseInsightCard';
import { QuickLogModal } from '../components/QuickLogModal';
import { PrivacyInfoModal } from '../components/PrivacyInfoModal';
import { CycleCalculator } from '../services/cycleCalculator';
import { StorageService } from '../services/storageService';
import { CycleRecord, DailyLog, UserProfile, FlowIntensity, MoodType } from '../types';
import { Colors } from '../constants/theme';

interface HomeScreenProps {
  cycles: CycleRecord[];
  dailyLogs: Record<string, DailyLog>;
  profile: UserProfile;
  onRefreshData: () => Promise<void>;
  onLockApp: () => void;
  onEnterStealth: () => void;
  onNavigateToLog: (dateStr: string) => void;
  isDark?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  cycles,
  dailyLogs,
  profile,
  onRefreshData,
  onLockApp,
  onEnterStealth,
  onNavigateToLog,
  isDark = false,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showQuickLog, setShowQuickLog] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  const currentStatus = CycleCalculator.getCurrentStatus(cycles, profile.cycleSettings, new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshData();
    setIsRefreshing(false);
  };

  const handleTogglePeriodToday = async () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await StorageService.togglePeriodStart(todayStr, 'medium');
    await onRefreshData();
  };

  const handleSaveQuickLog = async (flow: FlowIntensity, mood?: MoodType) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const existing = dailyLogs[todayStr] || {
      id: todayStr,
      date: todayStr,
      isPeriod: flow !== 'none',
      flow,
      moods: [],
      symptoms: [],
      activities: [],
      medications: [],
      updatedAt: new Date().toISOString(),
    };

    const updatedLog: DailyLog = {
      ...existing,
      isPeriod: flow !== 'none',
      flow,
      moods: mood ? Array.from(new Set([...existing.moods, mood])) : existing.moods,
      updatedAt: new Date().toISOString(),
    };

    await StorageService.saveDailyLog(updatedLog);
    await onRefreshData();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="CycleSereine"
        subtitle={undefined}
        showLock
        showStealth
        onLockPress={onLockApp}
        onStealthPress={onEnterStealth}
        isDark={isDark}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
        }
      >
        {/* Privacy badge */}
        <SecurityBadge onPress={() => setShowPrivacyModal(true)} isDark={isDark} />

        {/* Circular Cycle Progress Ring */}
        <CycleRing
          status={currentStatus}
          onLogPress={() => setShowQuickLog(true)}
          onPeriodToggle={handleTogglePeriodToday}
          onInsightPress={() => {}}
          isDark={isDark}
        />

        {/* Phase Wisdom & Educational Tips Card */}
        <PhaseInsightCard phase={currentStatus.currentPhase} isDark={isDark} />

        {/* Interactive Predictive Calendar */}
        <CalendarView
          cycles={cycles}
          dailyLogs={dailyLogs}
          settings={profile.cycleSettings}
          selectedDate={selectedDate}
          onSelectDate={(date) => setSelectedDate(date)}
          onOpenDayLog={(date) => onNavigateToLog(date)}
          isDark={isDark}
        />
      </ScrollView>

      {/* Fast Quick Log Popup */}
      <QuickLogModal
        visible={showQuickLog}
        onClose={() => setShowQuickLog(false)}
        onSaveQuick={handleSaveQuickLog}
        onOpenFullLog={() => onNavigateToLog(format(new Date(), 'yyyy-MM-dd'))}
        isDark={isDark}
      />

      {/* Privacy Guarantee Modal */}
      <PrivacyInfoModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        isDark={isDark}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
});
