import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, addMonths, subMonths, parseISO, isSameDay, getDay, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CycleCalculator, DayPredictionInfo } from '../services/cycleCalculator';
import { DailyLog, CycleRecord, CycleSettings } from '../types';
import { Colors, Shadows } from '../constants/theme';

interface CalendarViewProps {
  cycles: CycleRecord[];
  dailyLogs: Record<string, DailyLog>;
  settings: CycleSettings;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  onOpenDayLog: (dateStr: string) => void;
  isDark?: boolean;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  cycles,
  dailyLogs,
  settings,
  selectedDate,
  onSelectDate,
  onOpenDayLog,
  isDark = false,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const monthPredictions = CycleCalculator.getMonthPredictions(
    currentMonth,
    cycles,
    dailyLogs,
    settings
  );

  const selectedPrediction = monthPredictions.find((p) => p.date === selectedDate) || {
    date: selectedDate,
    phase: 'follicular',
    phaseName: 'Folliculaire',
    isPeriod: false,
    isPredictedPeriod: false,
    isFertile: false,
    isOvulationDay: false,
    isPms: false,
    fertilityLevel: 'low' as const,
    isCurrentCycle: true,
    log: dailyLogs[selectedDate],
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onSelectDate(format(today, 'yyyy-MM-dd'));
  };

  // Calculate empty padding slots at start of month (Monday = 1, Sunday = 0)
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startWeekday = (getDay(firstDayOfMonth) + 6) % 7; // Convert Sun=0..Sat=6 to Mon=0..Sun=6
  const paddingDays = Array.from({ length: startWeekday });

  const monthTitle = format(currentMonth, 'MMMM yyyy', { locale: fr });
  const formattedMonthTitle = monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={[styles.navBtn, { borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.monthTitleWrapper}>
          <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>{formattedMonthTitle}</Text>
          <TouchableOpacity onPress={handleToday} style={[styles.todayBadge, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.todayBadgeText, { color: colors.accent }]}>Aujourd’hui</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleNextMonth} style={[styles.navBtn, { borderColor: colors.border }]}>
          <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Weekdays Row */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day, idx) => (
          <Text key={idx} style={[styles.weekdayText, { color: colors.textMuted }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {paddingDays.map((_, idx) => (
          <View key={`pad-${idx}`} style={styles.dayCell} />
        ))}

        {monthPredictions.map((pred) => {
          const isSelected = pred.date === selectedDate;
          const isToday = isSameDay(parseISO(pred.date), new Date());
          const hasLog = !!pred.log;
          const dayNumber = parseISO(pred.date).getDate();

          // Determine cell styling
          let cellBg = 'transparent';
          let textColor = colors.textPrimary;
          let borderColor = 'transparent';

          if (pred.isPeriod) {
            cellBg = colors.periodLight;
            textColor = colors.period;
          } else if (pred.isOvulationDay) {
            cellBg = colors.ovulationLight;
            textColor = colors.ovulation;
          } else if (pred.isFertile) {
            cellBg = colors.ovulationLight;
            textColor = colors.ovulation;
          } else if (pred.isPms) {
            cellBg = isDark ? '#3A270D' : '#FEF3C7';
            textColor = colors.pms;
          }

          if (isSelected) {
            borderColor = colors.accent;
          }

          return (
            <TouchableOpacity
              key={pred.date}
              style={[
                styles.dayCell,
                {
                  backgroundColor: cellBg,
                  borderColor: isSelected ? colors.accent : 'transparent',
                  borderWidth: isSelected ? 2 : 0,
                },
              ]}
              onPress={() => onSelectDate(pred.date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayNumberText,
                  {
                    color: textColor,
                    fontWeight: isSelected || isToday ? '800' : '600',
                  },
                ]}
              >
                {dayNumber}
              </Text>

              {/* Badges / indicators under date */}
              <View style={styles.indicatorsRow}>
                {pred.isPeriod && (
                  <View style={[styles.tinyDot, { backgroundColor: colors.period }]} />
                )}
                {pred.isOvulationDay && (
                  <Ionicons name="sparkles" size={8} color={colors.ovulation} />
                )}
                {hasLog && (
                  <View style={[styles.logIndicatorDot, { backgroundColor: colors.accent }]} />
                )}
              </View>

              {isToday && (
                <View style={[styles.todayIndicator, { backgroundColor: colors.accent }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={[styles.legendRow, { borderTopColor: colors.borderLight }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.period }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Règles</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.ovulation }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Fertilité & Ovulation</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.pms }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>SPM</Text>
        </View>
      </View>

      {/* Selected Day Preview Card */}
      <View style={[styles.selectedDayCard, { backgroundColor: colors.surfaceSubtle }]}>
        <View style={styles.selectedDayInfo}>
          <Text style={[styles.selectedDateTitle, { color: colors.textPrimary }]}>
            {CycleCalculator.formatFrenchDate(selectedDate, 'EEEE d MMMM')}
          </Text>
          <Text style={[styles.selectedDatePhase, { color: colors.textSecondary }]}>
            {selectedPrediction.isPeriod
              ? '🩸 Jour de règles'
              : selectedPrediction.isOvulationDay
              ? '✨ Pic d’Ovulation'
              : selectedPrediction.isFertile
              ? '🌿 Fenêtre Fertile'
              : selectedPrediction.isPms
              ? '🌙 Phase SPM'
              : '🌱 Phase Folliculaire'}
            {selectedPrediction.cycleDayNumber ? ` • Jour ${selectedPrediction.cycleDayNumber}` : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.editLogBtn, { backgroundColor: colors.accent }]}
          onPress={() => onOpenDayLog(selectedDate)}
          activeOpacity={0.8}
        >
          <Ionicons name={selectedPrediction.log ? 'create-outline' : 'add-outline'} size={15} color="#FFFFFF" />
          <Text style={styles.editLogBtnText}>
            {selectedPrediction.log ? 'Modifier' : 'Ajouter log'}
          </Text>
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
    position: 'relative',
  },
  dayNumberText: {
    fontSize: 14,
  },
  indicatorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 6,
    marginTop: 1,
  },
  tinyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  logIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    marginTop: 10,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  selectedDayCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedDayInfo: {
    flex: 1,
    marginRight: 8,
  },
  selectedDateTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  selectedDatePhase: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  editLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editLogBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
