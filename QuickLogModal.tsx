import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { FlowIntensity, MoodType } from '../types';
import { FLOW_OPTIONS, MOOD_OPTIONS } from '../constants/symptoms';
import { Colors } from '../constants/theme';

interface QuickLogModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveQuick: (flow: FlowIntensity, mood?: MoodType) => void;
  onOpenFullLog: () => void;
  isDark?: boolean;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  visible,
  onClose,
  onSaveQuick,
  onOpenFullLog,
  isDark = false,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity>('medium');
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>('sereine');

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSaveQuick(selectedFlow, selectedMood);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.periodLight }]}>
                <Ionicons name="sparkles" size={16} color={colors.period} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Enregistrement Rapide</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Intensité du flux menstruel
          </Text>

          {/* Flow Selector */}
          <View style={styles.flowRow}>
            {FLOW_OPTIONS.map((f) => {
              const isSelected = selectedFlow === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.flowBtn,
                    {
                      backgroundColor: isSelected ? colors.periodLight : colors.surfaceSubtle,
                      borderColor: isSelected ? colors.period : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedFlow(f.id)}
                >
                  <Ionicons name={f.icon as any} size={18} color={isSelected ? colors.period : colors.textMuted} />
                  <Text
                    style={[
                      styles.flowBtnLabel,
                      { color: isSelected ? colors.period : colors.textPrimary },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, marginTop: 14 }]}>
            Humeur dominante
          </Text>

          {/* Top Mood Emojis */}
          <View style={styles.moodRow}>
            {MOOD_OPTIONS.slice(0, 5).map((m) => {
              const isSelected = selectedMood === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.moodBtn,
                    {
                      backgroundColor: isSelected ? colors.accentLight : colors.surfaceSubtle,
                      borderColor: isSelected ? colors.accent : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedMood(m.id)}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      { color: isSelected ? colors.accent : colors.textSecondary },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.fullLogBtn, { borderColor: colors.border }]}
              onPress={() => {
                onClose();
                onOpenFullLog();
              }}
            >
              <Text style={[styles.fullLogBtnText, { color: colors.textPrimary }]}>Journal complet...</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Valider</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  flowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  flowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  flowBtnLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moodBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    width: '18%',
  },
  moodEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  fullLogBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullLogBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
