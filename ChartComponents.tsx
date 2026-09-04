import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CycleRecord, DailyLog } from '../types';
import { Colors, Shadows } from '../constants/theme';
import { SYMPTOM_OPTIONS, MOOD_OPTIONS } from '../constants/symptoms';

interface ChartComponentsProps {
  cycles: CycleRecord[];
  logs: Record<string, DailyLog>;
  avgCycleLength: number;
  avgPeriodDuration: number;
  regularityStatus: string;
  isDark?: boolean;
}

const { width } = Dimensions.get('window');

export const CycleHistoryBarChart: React.FC<{
  cycles: CycleRecord[];
  avgCycleLength: number;
  isDark?: boolean;
}> = ({ cycles, avgCycleLength, isDark = false }) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const recentCycles = cycles.slice(0, 6).reverse();
  const maxDays = Math.max(...recentCycles.map((c) => c.totalCycleDays || 28), 35);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleWithIcon}>
          <Ionicons name="bar-chart-outline" size={18} color={colors.accent} />
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Durée des cycles précédents
          </Text>
        </View>
        <Text style={[styles.badgeText, { color: colors.accent, backgroundColor: colors.accentLight }]}>
          Moyenne : {avgCycleLength}j
        </Text>
      </View>

      <Text style={[styles.chartDesc, { color: colors.textSecondary }]}>
        Comparatif des {recentCycles.length} derniers cycles enregistrés (en jours)
      </Text>

      {/* Bar Chart */}
      <View style={styles.chartContainer}>
        {recentCycles.map((cycle, idx) => {
          const days = cycle.totalCycleDays || 28;
          const heightPercent = (days / maxDays) * 100;
          const isStandard = Math.abs(days - avgCycleLength) <= 2;

          return (
            <View key={cycle.id || idx} style={styles.barColumn}>
              <Text style={[styles.barValueText, { color: colors.textPrimary }]}>{days}j</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isStandard ? colors.period : colors.luteal,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabelText, { color: colors.textMuted }]}>
                C{recentCycles.length - idx}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Reference note */}
      <View style={[styles.refNoteRow, { borderTopColor: colors.borderLight }]}>
        <View style={[styles.refDot, { backgroundColor: colors.period }]} />
        <Text style={[styles.refText, { color: colors.textSecondary }]}>
          Cycles réguliers compris entre 24 et 35 jours
        </Text>
      </View>
    </View>
  );
};

export const SymptomsFrequencyChart: React.FC<{
  logs: Record<string, DailyLog>;
  isDark?: boolean;
}> = ({ logs, isDark = false }) => {
  const colors = isDark ? Colors.dark : Colors.light;

  // Compute symptom counts
  const counts: Record<string, number> = {};
  const allLogs = Object.values(logs);
  allLogs.forEach((l) => {
    (l.symptoms || []).forEach((s) => {
      counts[s] = (counts[s] || 0) + 1;
    });
  });

  const sortedSymptoms = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCount = sortedSymptoms.length > 0 ? sortedSymptoms[0][1] : 1;

  if (sortedSymptoms.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 6 }]}>
          🌸 Fréquence des symptômes
        </Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Enregistrez vos symptômes dans le Journal pour voir vos corrélations.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleWithIcon}>
          <Ionicons name="pulse-outline" size={18} color="#E85B7A" />
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Symptômes les plus récurrents
          </Text>
        </View>
      </View>

      <View style={styles.symptomList}>
        {sortedSymptoms.map(([symptomId, count]) => {
          const opt = SYMPTOM_OPTIONS.find((s) => s.id === symptomId);
          const label = opt ? opt.label : symptomId;
          const emoji = opt ? opt.emoji : '✨';
          const percent = (count / maxCount) * 100;

          return (
            <View key={symptomId} style={styles.symptomRow}>
              <View style={styles.symptomMeta}>
                <Text style={styles.symptomEmoji}>{emoji}</Text>
                <Text style={[styles.symptomLabel, { color: colors.textPrimary }]}>{label}</Text>
              </View>

              <View style={styles.progressWrapper}>
                <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSubtle }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percent}%`, backgroundColor: colors.period },
                    ]}
                  />
                </View>
                <Text style={[styles.countBadge, { color: colors.textSecondary }]}>
                  {count} {count > 1 ? 'fois' : 'fois'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const MoodDistributionChart: React.FC<{
  logs: Record<string, DailyLog>;
  isDark?: boolean;
}> = ({ logs, isDark = false }) => {
  const colors = isDark ? Colors.dark : Colors.light;

  const moodCounts: Record<string, number> = {};
  Object.values(logs).forEach((l) => {
    (l.moods || []).forEach((m) => {
      moodCounts[m] = (moodCounts[m] || 0) + 1;
    });
  });

  const sortedMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCount = sortedMoods.length > 0 ? sortedMoods[0][1] : 1;

  if (sortedMoods.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleWithIcon}>
          <Ionicons name="sunny-outline" size={18} color="#E69C24" />
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Paysage émotionnel & Humeurs
          </Text>
        </View>
      </View>

      <View style={styles.symptomList}>
        {sortedMoods.map(([moodId, count]) => {
          const opt = MOOD_OPTIONS.find((m) => m.id === moodId);
          const label = opt ? opt.label : moodId;
          const emoji = opt ? opt.emoji : '✨';
          const percent = (count / maxCount) * 100;

          return (
            <View key={moodId} style={styles.symptomRow}>
              <View style={styles.symptomMeta}>
                <Text style={styles.symptomEmoji}>{emoji}</Text>
                <Text style={[styles.symptomLabel, { color: colors.textPrimary }]}>{label}</Text>
              </View>

              <View style={styles.progressWrapper}>
                <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSubtle }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percent}%`, backgroundColor: '#E69C24' },
                    ]}
                  />
                </View>
                <Text style={[styles.countBadge, { color: colors.textSecondary }]}>
                  {count} {count > 1 ? 'jours' : 'jour'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const TemperatureTrendChart: React.FC<{
  logs: Record<string, DailyLog>;
  isDark?: boolean;
}> = ({ logs, isDark = false }) => {
  const colors = isDark ? Colors.dark : Colors.light;

  // Filter logs with temperature
  const tempLogs = Object.values(logs)
    .filter((l) => typeof l.temperature === 'number' && l.temperature > 35 && l.temperature < 40)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10);

  if (tempLogs.length < 2) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleWithIcon}>
          <Ionicons name="thermometer-outline" size={18} color="#38A3A5" />
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Température Basale (°C)
          </Text>
        </View>
      </View>

      <Text style={[styles.chartDesc, { color: colors.textSecondary }]}>
        Symptothermie : hausse thermique caractéristique post-ovulatoire
      </Text>

      <View style={styles.tempPointsRow}>
        {tempLogs.map((item, idx) => (
          <View key={item.date} style={styles.tempCol}>
            <Text style={[styles.tempValText, { color: colors.textPrimary }]}>
              {item.temperature?.toFixed(1)}°
            </Text>
            <View style={[styles.tempDot, { backgroundColor: '#38A3A5' }]} />
            <Text style={[styles.tempDateText, { color: colors.textMuted }]}>
              {item.date.split('-')[2]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    marginVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  chartDesc: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
    marginBottom: 10,
  },
  barColumn: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 38,
  },
  barValueText: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 75,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barLabelText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  refNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
  },
  refDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  refText: {
    fontSize: 11,
    fontWeight: '500',
  },
  symptomList: {
    gap: 12,
    marginTop: 8,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  symptomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  symptomEmoji: {
    fontSize: 16,
  },
  symptomLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  countBadge: {
    fontSize: 11,
    fontWeight: '600',
    width: 45,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  tempPointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tempCol: {
    alignItems: 'center',
    gap: 4,
  },
  tempValText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tempDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tempDateText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
