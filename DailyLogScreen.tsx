import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { format, parseISO, addDays, subDays } from 'date-fns';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Header } from '../components/Header';
import { StorageService } from '../services/storageService';
import { CycleCalculator } from '../services/cycleCalculator';
import {
  DailyLog,
  FlowIntensity,
  MoodType,
  SymptomType,
  CervicalMucus,
  SelfCareActivity,
} from '../types';
import {
  FLOW_OPTIONS,
  MOOD_OPTIONS,
  SYMPTOM_OPTIONS,
  CERVICAL_MUCUS_OPTIONS,
  SELF_CARE_OPTIONS,
} from '../constants/symptoms';
import { Colors, Shadows } from '../constants/theme';

interface DailyLogScreenProps {
  initialDate?: string;
  dailyLogs: Record<string, DailyLog>;
  onSaveLog: (log: DailyLog) => Promise<void>;
  onLockApp: () => void;
  onEnterStealth: () => void;
  isDark?: boolean;
}

export const DailyLogScreen: React.FC<DailyLogScreenProps> = ({
  initialDate,
  dailyLogs,
  onSaveLog,
  onLockApp,
  onEnterStealth,
  isDark = false,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const [currentDate, setCurrentDate] = useState<string>(
    initialDate || format(new Date(), 'yyyy-MM-dd')
  );

  // Form State
  const [isPeriod, setIsPeriod] = useState<boolean>(false);
  const [flow, setFlow] = useState<FlowIntensity>('none');
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [cervicalMucus, setCervicalMucus] = useState<CervicalMucus | undefined>(undefined);
  const [temperature, setTemperature] = useState<number>(36.5);
  const [hasTemp, setHasTemp] = useState<boolean>(false);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [waterGlasses, setWaterGlasses] = useState<number>(6);
  const [stressLevel, setStressLevel] = useState<number>(2);
  const [selectedActivities, setSelectedActivities] = useState<SelfCareActivity[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Load existing data when date changes
  useEffect(() => {
    const existing = dailyLogs[currentDate];
    if (existing) {
      setIsPeriod(existing.isPeriod || false);
      setFlow(existing.flow || 'none');
      setSelectedMoods(existing.moods || []);
      setSelectedSymptoms(existing.symptoms || []);
      setCervicalMucus(existing.cervicalMucus);
      if (existing.temperature) {
        setTemperature(existing.temperature);
        setHasTemp(true);
      } else {
        setHasTemp(false);
      }
      setSleepHours(existing.sleepHours || 7.5);
      setWaterGlasses(existing.waterGlasses || 6);
      setStressLevel(existing.stressLevel || 2);
      setSelectedActivities(existing.activities || []);
      setNotes(existing.notes || '');
    } else {
      // Clean slate
      setIsPeriod(false);
      setFlow('none');
      setSelectedMoods([]);
      setSelectedSymptoms([]);
      setCervicalMucus(undefined);
      setHasTemp(false);
      setSleepHours(7.5);
      setWaterGlasses(6);
      setStressLevel(2);
      setSelectedActivities([]);
      setNotes('');
    }
  }, [currentDate, dailyLogs]);

  const handlePrevDay = () => {
    const d = subDays(parseISO(currentDate), 1);
    setCurrentDate(format(d, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const d = addDays(parseISO(currentDate), 1);
    setCurrentDate(format(d, 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    setCurrentDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const toggleMood = (m: MoodType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedMoods.includes(m)) {
      setSelectedMoods(selectedMoods.filter((item) => item !== m));
    } else {
      setSelectedMoods([...selectedMoods, m]);
    }
  };

  const toggleSymptom = (s: SymptomType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedSymptoms.includes(s)) {
      setSelectedSymptoms(selectedSymptoms.filter((item) => item !== s));
    } else {
      setSelectedSymptoms([...selectedSymptoms, s]);
    }
  };

  const toggleActivity = (a: SelfCareActivity) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedActivities.includes(a)) {
      setSelectedActivities(selectedActivities.filter((item) => item !== a));
    } else {
      setSelectedActivities([...selectedActivities, a]);
    }
  };

  const handleFlowSelect = (selected: FlowIntensity) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (flow === selected) {
      setFlow('none');
      setIsPeriod(false);
    } else {
      setFlow(selected);
      setIsPeriod(true);
    }
  };

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const log: DailyLog = {
      id: currentDate,
      date: currentDate,
      isPeriod: flow !== 'none' || isPeriod,
      flow,
      moods: selectedMoods,
      symptoms: selectedSymptoms,
      cervicalMucus,
      temperature: hasTemp ? temperature : undefined,
      sleepHours,
      waterGlasses,
      stressLevel,
      activities: selectedActivities,
      medications: [],
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    await onSaveLog(log);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const formattedDate = CycleCalculator.formatFrenchDate(currentDate, "EEEE d MMMM yyyy");

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Journal Intime"
        subtitle="Enregistrement chiffré AES-256"
        showLock
        showStealth
        onLockPress={onLockApp}
        onStealthPress={onEnterStealth}
        isDark={isDark}
      />

      {/* Date Navigation Bar */}
      <View style={[styles.dateNav, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.dateNavBtn} onPress={handlePrevDay}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleToday} style={styles.dateCenter}>
          <Text style={[styles.dateTitleText, { color: colors.textPrimary }]}>{formattedDate}</Text>
          <Text style={[styles.dateSubText, { color: colors.accent }]}>
            {currentDate === format(new Date(), 'yyyy-MM-dd') ? 'Aujourd’hui' : 'Changer de jour'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dateNavBtn} onPress={handleNextDay}>
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Menstrual Flow */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="water" size={20} color={colors.period} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Règles & Flux Menstruel
            </Text>
          </View>

          <View style={styles.flowGrid}>
            {FLOW_OPTIONS.map((f) => {
              const isSelected = flow === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.flowCard,
                    {
                      backgroundColor: isSelected ? colors.periodLight : colors.surfaceSubtle,
                      borderColor: isSelected ? colors.period : 'transparent',
                    },
                  ]}
                  onPress={() => handleFlowSelect(f.id)}
                >
                  <Ionicons
                    name={f.icon as any}
                    size={22}
                    color={isSelected ? colors.period : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.flowTitle,
                      { color: isSelected ? colors.period : colors.textPrimary },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {f.label}
                  </Text>
                  <Text style={[styles.flowDesc, { color: colors.textSecondary }]}>{f.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Moods & Emotions */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sunny" size={20} color="#E69C24" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Humeurs & État Émotionnel ({selectedMoods.length})
            </Text>
          </View>

          <View style={styles.chipsGrid}>
            {MOOD_OPTIONS.map((m) => {
              const isSelected = selectedMoods.includes(m.id);
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.accentLight : colors.surfaceSubtle,
                      borderColor: isSelected ? colors.accent : 'transparent',
                    },
                  ]}
                  onPress={() => toggleMood(m.id)}
                >
                  <Text style={styles.chipEmoji}>{m.emoji}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: isSelected ? colors.accent : colors.textPrimary },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Physical Symptoms */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pulse" size={20} color={colors.period} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Symptômes Physiques ({selectedSymptoms.length})
            </Text>
          </View>

          <View style={styles.chipsGrid}>
            {SYMPTOM_OPTIONS.map((s) => {
              const isSelected = selectedSymptoms.includes(s.id);
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.periodLight : colors.surfaceSubtle,
                      borderColor: isSelected ? colors.period : 'transparent',
                    },
                  ]}
                  onPress={() => toggleSymptom(s.id)}
                >
                  <Text style={styles.chipEmoji}>{s.emoji}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: isSelected ? colors.period : colors.textPrimary },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. Symptothermy: Cervical Mucus & Basal Temperature */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="leaf" size={20} color="#38A3A5" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Symptothermie & Fertilité
            </Text>
          </View>

          {/* Cervical Mucus */}
          <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>
            Glaire Cervicale
          </Text>
          <View style={styles.mucusGrid}>
            {CERVICAL_MUCUS_OPTIONS.map((c) => {
              const isSelected = cervicalMucus === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.mucusBtn,
                    {
                      backgroundColor: isSelected ? '#E0F2FE' : colors.surfaceSubtle,
                      borderColor: isSelected ? '#0284C7' : 'transparent',
                    },
                  ]}
                  onPress={() => setCervicalMucus(isSelected ? undefined : c.id)}
                >
                  <Text
                    style={[
                      styles.mucusLabel,
                      { color: isSelected ? '#0284C7' : colors.textPrimary },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {c.label}
                  </Text>
                  <Text style={[styles.mucusDesc, { color: colors.textSecondary }]}>{c.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Basal Temperature */}
          <Text style={[styles.subSectionTitle, { color: colors.textSecondary, marginTop: 14 }]}>
            Température Basale au réveil (°C)
          </Text>
          <View style={styles.tempRow}>
            <TouchableOpacity
              style={[
                styles.tempToggleBtn,
                { backgroundColor: hasTemp ? '#E0F2FE' : colors.surfaceSubtle },
              ]}
              onPress={() => setHasTemp(!hasTemp)}
            >
              <Ionicons
                name="thermometer"
                size={18}
                color={hasTemp ? '#0284C7' : colors.textMuted}
              />
              <Text
                style={[
                  styles.tempToggleText,
                  { color: hasTemp ? '#0284C7' : colors.textSecondary },
                ]}
              >
                {hasTemp ? `${temperature.toFixed(2)} °C` : 'Non mesurée'}
              </Text>
            </TouchableOpacity>

            {hasTemp && (
              <View style={styles.tempAdjuster}>
                <TouchableOpacity
                  style={[styles.tempBtn, { backgroundColor: colors.surfaceSubtle }]}
                  onPress={() => setTemperature(Math.max(35.0, Math.round((temperature - 0.1) * 10) / 10))}
                >
                  <Ionicons name="remove" size={18} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.tempValueDisplay, { color: colors.textPrimary }]}>
                  {temperature.toFixed(2)}°C
                </Text>
                <TouchableOpacity
                  style={[styles.tempBtn, { backgroundColor: colors.surfaceSubtle }]}
                  onPress={() => setTemperature(Math.min(39.0, Math.round((temperature + 0.1) * 10) / 10))}
                >
                  <Ionicons name="add" size={18} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* 5. Lifestyle, Sleep & Hydration */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={20} color="#9D78BE" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Bien-Être, Eau & Sommeil
            </Text>
          </View>

          {/* Water glasses */}
          <View style={styles.counterRow}>
            <View style={styles.counterLabelCol}>
              <Text style={[styles.counterLabel, { color: colors.textPrimary }]}>💧 Hydratation</Text>
              <Text style={[styles.counterSub, { color: colors.textSecondary }]}>
                {waterGlasses} verres (~{(waterGlasses * 0.25).toFixed(1)} L)
              </Text>
            </View>
            <View style={styles.counterControls}>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surfaceSubtle }]}
                onPress={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
              >
                <Ionicons name="remove" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.counterCount, { color: colors.textPrimary }]}>{waterGlasses}</Text>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surfaceSubtle }]}
                onPress={() => setWaterGlasses(Math.min(15, waterGlasses + 1))}
              >
                <Ionicons name="add" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sleep hours */}
          <View style={styles.counterRow}>
            <View style={styles.counterLabelCol}>
              <Text style={[styles.counterLabel, { color: colors.textPrimary }]}>🌙 Sommeil</Text>
              <Text style={[styles.counterSub, { color: colors.textSecondary }]}>{sleepHours} heures</Text>
            </View>
            <View style={styles.counterControls}>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surfaceSubtle }]}
                onPress={() => setSleepHours(Math.max(3, sleepHours - 0.5))}
              >
                <Ionicons name="remove" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.counterCount, { color: colors.textPrimary }]}>{sleepHours}h</Text>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surfaceSubtle }]}
                onPress={() => setSleepHours(Math.min(14, sleepHours + 0.5))}
              >
                <Ionicons name="add" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Self Care chips */}
          <Text style={[styles.subSectionTitle, { color: colors.textSecondary, marginTop: 10 }]}>
            Rituels Douceur
          </Text>
          <View style={styles.chipsGrid}>
            {SELF_CARE_OPTIONS.map((a) => {
              const isSelected = selectedActivities.includes(a.id);
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? '#F3E8FF' : colors.surfaceSubtle,
                      borderColor: isSelected ? '#9333EA' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleActivity(a.id)}
                >
                  <Ionicons
                    name={a.icon as any}
                    size={16}
                    color={isSelected ? '#9333EA' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: isSelected ? '#9333EA' : colors.textPrimary },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {a.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 6. Encrypted Personal Journal Note */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={20} color="#059669" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Note Privée Chiffrée (AES-256)
            </Text>
          </View>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
            Déposez vos pensées et observations intimes. Ce texte est chiffré avant tout enregistrement.
          </Text>

          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: colors.surfaceSubtle,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            placeholder="Écrivez vos ressentis intimes ici..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: isSaved ? '#10B981' : colors.accent, ...Shadows.glow(colors.accent) },
          ]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isSaved ? 'checkmark-circle' : 'save-outline'}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.saveButtonText}>
            {isSaved ? 'Enregistré & Chiffré avec succès !' : 'Enregistrer mes observations'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  dateNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenter: {
    alignItems: 'center',
  },
  dateTitleText: {
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  dateSubText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  sectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  flowGrid: {
    gap: 8,
  },
  flowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  flowTitle: {
    fontSize: 14,
    fontWeight: '600',
    width: 100,
  },
  flowDesc: {
    fontSize: 11,
    flex: 1,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  mucusGrid: {
    gap: 6,
  },
  mucusBtn: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  mucusLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  mucusDesc: {
    fontSize: 11,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  tempToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
  },
  tempToggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tempAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tempBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempValueDisplay: {
    fontSize: 14,
    fontWeight: '800',
    minWidth: 55,
    textAlign: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  counterLabelCol: {
    gap: 2,
  },
  counterLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  counterSub: {
    fontSize: 12,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterCount: {
    fontSize: 15,
    fontWeight: '800',
    minWidth: 28,
    textAlign: 'center',
  },
  notesInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    lineHeight: 19,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
