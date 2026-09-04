import { format, parseISO, differenceInDays, addDays, subDays, isSameDay, isWithinInterval, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CyclePhase, CycleRecord, DailyLog, CycleSettings } from '../types';

export interface DayPredictionInfo {
  date: string; // YYYY-MM-DD
  isCurrentCycle: boolean;
  cycleDayNumber?: number;
  phase: CyclePhase;
  phaseName: string;
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isOvulationDay: boolean;
  isPms: boolean;
  fertilityLevel: 'low' | 'medium' | 'high' | 'peak';
  log?: DailyLog;
}

export interface CurrentCycleStatus {
  currentDayNumber: number;
  totalCycleDays: number;
  currentPhase: CyclePhase;
  phaseTitle: string;
  daysUntilNextPeriod: number;
  nextPeriodStartDate: string;
  ovulationDate: string;
  fertilityStatus: 'Faible' | 'Modérée' | 'Élevée' | 'Pic d’ovulation';
  progressPercentage: number; // 0 to 1
  isPeriodActive: boolean;
  currentPeriodDay: number;
}

export class CycleCalculator {
  /**
   * Calculates detailed status of the active cycle relative to today (or reference date)
   */
  public static getCurrentStatus(
    cycles: CycleRecord[],
    settings: CycleSettings,
    today: Date = new Date()
  ): CurrentCycleStatus {
    const todayStr = format(today, 'yyyy-MM-dd');
    const sortedCycles = [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate));
    
    // Find the latest cycle start date
    let latestCycleStart = sortedCycles.length > 0 ? parseISO(sortedCycles[0].startDate) : subDays(today, 12);
    
    // If today is past the expected next cycle, compute an adjusted projected start
    let daysSinceStart = differenceInDays(today, latestCycleStart);
    if (daysSinceStart < 0) {
      latestCycleStart = today;
      daysSinceStart = 0;
    }

    const cycleLength = settings.averageCycleLength || 28;
    const periodLength = settings.averagePeriodLength || 5;
    const lutealLength = settings.lutealPhaseLength || 14;
    const ovulationOffset = cycleLength - lutealLength; // e.g., 28 - 14 = Day 14

    const cycleDay = (daysSinceStart % cycleLength) + 1;
    const currentPeriodDay = cycleDay <= periodLength ? cycleDay : 0;
    const isPeriodActive = cycleDay <= periodLength;

    // Phase identification
    let currentPhase: CyclePhase = 'follicular';
    let phaseTitle = 'Phase Folliculaire';
    let fertilityStatus: 'Faible' | 'Modérée' | 'Élevée' | 'Pic d’ovulation' = 'Faible';

    if (cycleDay <= periodLength) {
      currentPhase = 'menstrual';
      phaseTitle = 'Phase Menstruelle';
      fertilityStatus = 'Faible';
    } else if (cycleDay < ovulationOffset - 4) {
      currentPhase = 'follicular';
      phaseTitle = 'Phase Folliculaire';
      fertilityStatus = 'Faible';
    } else if (cycleDay >= ovulationOffset - 4 && cycleDay <= ovulationOffset + 1) {
      currentPhase = 'ovulation';
      phaseTitle = 'Fenêtre Fertile & Ovulation';
      fertilityStatus = cycleDay === ovulationOffset ? 'Pic d’ovulation' : 'Élevée';
    } else if (cycleDay > cycleLength - 5) {
      currentPhase = 'pms';
      phaseTitle = 'Phase Prémenstruelle (SPM)';
      fertilityStatus = 'Faible';
    } else {
      currentPhase = 'luteal';
      phaseTitle = 'Phase Lutéale';
      fertilityStatus = 'Faible';
    }

    const daysUntilNextPeriod = Math.max(1, cycleLength - cycleDay + 1);
    const nextPeriodDate = addDays(today, daysUntilNextPeriod - 1);
    const ovulationDate = addDays(latestCycleStart, ovulationOffset - 1);

    const progressPercentage = Math.min(1, Math.max(0, cycleDay / cycleLength));

    return {
      currentDayNumber: cycleDay,
      totalCycleDays: cycleLength,
      currentPhase,
      phaseTitle,
      daysUntilNextPeriod,
      nextPeriodStartDate: format(nextPeriodDate, 'yyyy-MM-dd'),
      ovulationDate: format(ovulationDate, 'yyyy-MM-dd'),
      fertilityStatus,
      progressPercentage,
      isPeriodActive,
      currentPeriodDay,
    };
  }

  /**
   * Predicts calendar days info for an entire month
   */
  public static getMonthPredictions(
    monthDate: Date,
    cycles: CycleRecord[],
    dailyLogs: Record<string, DailyLog>,
    settings: CycleSettings
  ): DayPredictionInfo[] {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start, end });

    const sortedCycles = [...cycles].sort((a, b) => a.startDate.localeCompare(b.startDate));
    const latestCycle = sortedCycles[sortedCycles.length - 1];
    const baseStartDate = latestCycle ? parseISO(latestCycle.startDate) : subDays(new Date(), 14);

    const cycleLength = settings.averageCycleLength || 28;
    const periodLength = settings.averagePeriodLength || 5;
    const lutealLength = settings.lutealPhaseLength || 14;
    const ovulationOffset = cycleLength - lutealLength; // e.g. Day 14

    return daysInMonth.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const log = dailyLogs[dateStr];

      // Calculate days difference from latest known cycle start
      const diff = differenceInDays(day, baseStartDate);
      let cycleDayIndex = diff % cycleLength;
      if (cycleDayIndex < 0) {
        cycleDayIndex += cycleLength;
      }
      const cycleDayNumber = cycleDayIndex + 1;

      // Check if actual log has period
      const isActualPeriod = log ? log.isPeriod && log.flow !== 'none' : false;
      const isPredictedPeriod = !log && cycleDayNumber <= periodLength;
      const isPeriod = isActualPeriod || isPredictedPeriod;

      let phase: CyclePhase = 'follicular';
      let phaseName = 'Folliculaire';
      let fertilityLevel: 'low' | 'medium' | 'high' | 'peak' = 'low';
      let isOvulationDay = false;
      let isFertile = false;
      let isPms = false;

      if (isPeriod) {
        phase = 'menstrual';
        phaseName = 'Règles';
        fertilityLevel = 'low';
      } else if (cycleDayNumber === ovulationOffset) {
        phase = 'ovulation';
        phaseName = 'Ovulation';
        fertilityLevel = 'peak';
        isOvulationDay = true;
        isFertile = true;
      } else if (cycleDayNumber >= ovulationOffset - 4 && cycleDayNumber <= ovulationOffset + 1) {
        phase = 'ovulation';
        phaseName = 'Fertile';
        fertilityLevel = 'high';
        isFertile = true;
      } else if (cycleDayNumber > cycleLength - 5) {
        phase = 'pms';
        phaseName = 'SPM';
        fertilityLevel = 'low';
        isPms = true;
      } else if (cycleDayNumber > ovulationOffset) {
        phase = 'luteal';
        phaseName = 'Lutéale';
        fertilityLevel = 'low';
      } else {
        phase = 'follicular';
        phaseName = 'Folliculaire';
        fertilityLevel = 'low';
      }

      return {
        date: dateStr,
        isCurrentCycle: true,
        cycleDayNumber,
        phase,
        phaseName,
        isPeriod,
        isPredictedPeriod: !isActualPeriod && isPredictedPeriod,
        isFertile,
        isOvulationDay,
        isPms,
        fertilityLevel,
        log,
      };
    });
  }

  /**
   * Generates summary metrics across cycle history
   */
  public static getCycleStatistics(cycles: CycleRecord[], logs: Record<string, DailyLog>) {
    const cycleLengths = cycles.map(c => c.totalCycleDays || 28);
    const periodLengths = cycles.map(c => c.periodDurationDays || 5);

    const avgCycle = cycleLengths.length > 0
      ? Math.round((cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) * 10) / 10
      : 28;

    const avgPeriod = periodLengths.length > 0
      ? Math.round((periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length) * 10) / 10
      : 5;

    // Regularity variation calculation
    const variance = cycleLengths.length > 1
      ? Math.sqrt(cycleLengths.reduce((sum, val) => sum + Math.pow(val - avgCycle, 2), 0) / cycleLengths.length)
      : 0;

    let regularityStatus = 'Très régulier';
    if (variance > 4) regularityStatus = 'Irrégulier';
    else if (variance > 2) regularityStatus = 'Modérément régulier';

    // Symptom frequencies
    const symptomCounts: Record<string, number> = {};
    const moodCounts: Record<string, number> = {};

    Object.values(logs).forEach(log => {
      (log.symptoms || []).forEach(s => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
      (log.moods || []).forEach(m => {
        moodCounts[m] = (moodCounts[m] || 0) + 1;
      });
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const topMoods = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      avgCycleLength: avgCycle,
      avgPeriodDuration: avgPeriod,
      regularityStatus,
      totalTrackedCycles: cycles.length,
      topSymptoms,
      topMoods,
    };
  }

  /**
   * Formats a French date nicely (e.g. "Mardi 14 Mai")
   */
  public static formatFrenchDate(dateStr: string | Date, formatStr: string = "EEEE d MMMM"): string {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    const formatted = format(date, formatStr, { locale: fr });
    // Capitalize first letter
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
}
