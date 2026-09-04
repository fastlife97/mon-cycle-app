import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CurrentCycleStatus } from '../services/cycleCalculator';
import { Colors, Shadows } from '../constants/theme';

interface CycleRingProps {
  status: CurrentCycleStatus;
  onLogPress: () => void;
  onPeriodToggle: () => void;
  onInsightPress: () => void;
  isDark?: boolean;
}

const { width } = Dimensions.get('window');
const RING_SIZE = Math.min(width - 56, 280);
const STROKE_WIDTH = 14;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const CycleRing: React.FC<CycleRingProps> = ({
  status,
  onLogPress,
  onPeriodToggle,
  onInsightPress,
  isDark = false,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;

  // Select phase colors
  let phaseColor = colors.period;
  let phaseColorLight = colors.periodLight;
  let gradientColors = colors.periodGradient;
  let phaseBadgeText = 'Règles en cours';
  let phaseIcon = 'water';

  switch (status.currentPhase) {
    case 'follicular':
      phaseColor = colors.follicular;
      phaseColorLight = colors.follicularLight;
      gradientColors = colors.follicularGradient;
      phaseBadgeText = 'Phase Folliculaire';
      phaseIcon = 'leaf';
      break;
    case 'ovulation':
      phaseColor = colors.ovulation;
      phaseColorLight = colors.ovulationLight;
      gradientColors = colors.ovulationGradient;
      phaseBadgeText = status.fertilityStatus === 'Pic d’ovulation' ? 'Pic d’Ovulation' : 'Fenêtre Fertile';
      phaseIcon = 'sunny';
      break;
    case 'luteal':
      phaseColor = colors.luteal;
      phaseColorLight = colors.lutealLight;
      gradientColors = colors.lutealGradient;
      phaseBadgeText = 'Phase Lutéale';
      phaseIcon = 'moon';
      break;
    case 'pms':
      phaseColor = colors.pms;
      phaseColorLight = colors.pmsLight;
      gradientColors = [colors.pms, '#F87171'];
      phaseBadgeText = 'Phase SPM';
      phaseIcon = 'sparkles';
      break;
    case 'menstrual':
    default:
      phaseColor = colors.period;
      phaseColorLight = colors.periodLight;
      gradientColors = colors.periodGradient;
      phaseBadgeText = status.isPeriodActive ? `Règles • Jour ${status.currentPeriodDay}` : 'Phase Menstruelle';
      phaseIcon = 'water';
      break;
  }

  const strokeDashoffset = CIRCUMFERENCE - (status.progressPercentage * CIRCUMFERENCE);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
      {/* Top Phase Header Badge */}
      <TouchableOpacity
        style={[styles.phasePill, { backgroundColor: phaseColorLight }]}
        onPress={onInsightPress}
        activeOpacity={0.8}
      >
        <Ionicons name={phaseIcon as any} size={14} color={phaseColor} />
        <Text style={[styles.phasePillText, { color: phaseColor }]}>{phaseBadgeText}</Text>
        <Ionicons name="sparkles" size={12} color={phaseColor} />
      </TouchableOpacity>

      {/* SVG Ring Visualizer */}
      <View style={styles.ringWrapper}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={styles.svg}>
          <Defs>
            <LinearGradient id="cycleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>

          {/* Background circle track */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={isDark ? '#2A2137' : '#F2E8EB'}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          {/* Active progress stroke */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke="url(#cycleGradient)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </Svg>

        {/* Center Ring Content */}
        <View style={styles.innerContent}>
          <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
            CYCLE ACTUEL
          </Text>
          <View style={styles.dayNumberRow}>
            <Text style={[styles.dayNumber, { color: colors.textPrimary }]}>
              Jour {status.currentDayNumber}
            </Text>
          </View>
          <Text style={[styles.cycleTotalLabel, { color: colors.textMuted }]}>
            sur ~{status.totalCycleDays} jours
          </Text>

          {/* Status highlight pill */}
          <View style={[styles.daysToPeriodBadge, { backgroundColor: isDark ? '#261C30' : '#FFF3F6' }]}>
            <Ionicons
              name={status.isPeriodActive ? 'water' : 'time-outline'}
              size={14}
              color={status.isPeriodActive ? colors.period : colors.textSecondary}
            />
            <Text
              style={[
                styles.daysToPeriodText,
                { color: status.isPeriodActive ? colors.period : colors.textPrimary },
              ]}
            >
              {status.isPeriodActive
                ? 'Règles en cours'
                : `Prochaines règles dans ${status.daysUntilNextPeriod}j`}
            </Text>
          </View>

          {/* Fertility status indicator */}
          <View style={styles.fertilityRow}>
            <View
              style={[
                styles.fertilityDot,
                {
                  backgroundColor:
                    status.fertilityStatus === 'Pic d’ovulation' || status.fertilityStatus === 'Élevée'
                      ? '#E69C24'
                      : '#10B981',
                },
              ]}
            />
            <Text style={[styles.fertilityText, { color: colors.textSecondary }]}>
              Probabilité de grossesse : <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{status.fertilityStatus}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.periodBtn,
            {
              backgroundColor: status.isPeriodActive ? colors.period : colors.surfaceSubtle,
              borderColor: status.isPeriodActive ? colors.period : colors.border,
            },
          ]}
          onPress={onPeriodToggle}
          activeOpacity={0.8}
        >
          <Ionicons
            name="water"
            size={16}
            color={status.isPeriodActive ? '#FFFFFF' : colors.period}
          />
          <Text
            style={[
              styles.periodBtnText,
              { color: status.isPeriodActive ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            {status.isPeriodActive ? 'Fin des règles' : 'Début des règles'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logBtn, { backgroundColor: colors.accent, ...Shadows.glow(colors.accent) }]}
          onPress={onLogPress}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={17} color="#FFFFFF" />
          <Text style={styles.logBtnText}>Noter la journée</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    marginVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  phasePillText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  svg: {
    position: 'absolute',
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  dayNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dayNumber: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cycleTotalLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: -2,
    marginBottom: 8,
  },
  daysToPeriodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 8,
  },
  daysToPeriodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fertilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fertilityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  fertilityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 14,
  },
  periodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  periodBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  logBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
  },
  logBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
