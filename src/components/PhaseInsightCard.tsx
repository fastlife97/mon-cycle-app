import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CyclePhase } from '../types';
import { PHASE_INSIGHTS } from '../constants/educationalTips';
import { Colors, Shadows } from '../constants/theme';

interface PhaseInsightCardProps {
  phase: CyclePhase;
  isDark?: boolean;
}

export const PhaseInsightCard: React.FC<PhaseInsightCardProps> = ({ phase, isDark = false }) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const [activeTab, setActiveTab] = useState<'energy' | 'nutrition' | 'movement' | 'affirmation'>('energy');

  const insight = PHASE_INSIGHTS[phase] || PHASE_INSIGHTS.follicular;

  let themeColor = colors.follicular;
  let themeLight = colors.follicularLight;

  if (phase === 'menstrual') {
    themeColor = colors.period;
    themeLight = colors.periodLight;
  } else if (phase === 'ovulation') {
    themeColor = colors.ovulation;
    themeLight = colors.ovulationLight;
  } else if (phase === 'luteal') {
    themeColor = colors.luteal;
    themeLight = colors.lutealLight;
  } else if (phase === 'pms') {
    themeColor = colors.pms;
    themeLight = isDark ? '#3A270D' : '#FEF3C7';
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.soft]}>
      {/* Title Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleInfo}>
          <View style={[styles.badge, { backgroundColor: themeLight }]}>
            <Ionicons name={insight.icon as any} size={14} color={themeColor} />
            <Text style={[styles.badgeText, { color: themeColor }]}>{insight.badge}</Text>
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{insight.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{insight.subtitle}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surfaceSubtle }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'energy' && [styles.activeTab, { backgroundColor: colors.surface }],
          ]}
          onPress={() => setActiveTab('energy')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'energy' ? themeColor : colors.textSecondary },
              activeTab === 'energy' && { fontWeight: '700' },
            ]}
          >
            ⚡️ Énergie
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'nutrition' && [styles.activeTab, { backgroundColor: colors.surface }],
          ]}
          onPress={() => setActiveTab('nutrition')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'nutrition' ? themeColor : colors.textSecondary },
              activeTab === 'nutrition' && { fontWeight: '700' },
            ]}
          >
            🥑 Nutrition
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'movement' && [styles.activeTab, { backgroundColor: colors.surface }],
          ]}
          onPress={() => setActiveTab('movement')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'movement' ? themeColor : colors.textSecondary },
              activeTab === 'movement' && { fontWeight: '700' },
            ]}
          >
            🧘‍♀️ Mouvement
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'affirmation' && [styles.activeTab, { backgroundColor: colors.surface }],
          ]}
          onPress={() => setActiveTab('affirmation')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'affirmation' ? themeColor : colors.textSecondary },
              activeTab === 'affirmation' && { fontWeight: '700' },
            ]}
          >
            ✨ Douceur
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Tab Content */}
      <View style={[styles.contentBox, { backgroundColor: themeLight }]}>
        {activeTab === 'energy' && (
          <View style={styles.detailBlock}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Hormones :</Text>
              <Text style={[styles.detailText, { color: colors.textPrimary }]}>{insight.hormones}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>État d'esprit :</Text>
              <Text style={[styles.detailText, { color: colors.textPrimary }]}>{insight.mindsetTip}</Text>
            </View>
          </View>
        )}

        {activeTab === 'nutrition' && (
          <View style={styles.detailBlock}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Alimentation conseillée :</Text>
              <Text style={[styles.detailText, { color: colors.textPrimary }]}>{insight.nutritionTip}</Text>
            </View>
          </View>
        )}

        {activeTab === 'movement' && (
          <View style={styles.detailBlock}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Activité physique :</Text>
              <Text style={[styles.detailText, { color: colors.textPrimary }]}>{insight.movementTip}</Text>
            </View>
          </View>
        )}

        {activeTab === 'affirmation' && (
          <View style={[styles.detailBlock, styles.affirmationBox]}>
            <Ionicons name="sparkles" size={18} color={themeColor} />
            <Text style={[styles.affirmationText, { color: colors.textPrimary }]}>
              « {insight.affirmation} »
            </Text>
          </View>
        )}
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleInfo: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  contentBox: {
    padding: 14,
    borderRadius: 16,
  },
  detailBlock: {
    gap: 8,
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  affirmationBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  affirmationText: {
    fontSize: 14,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
});
