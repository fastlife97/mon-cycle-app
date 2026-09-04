import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';
import { CycleCalculator } from '../services/cycleCalculator';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLock?: boolean;
  showStealth?: boolean;
  onLockPress?: () => void;
  onStealthPress?: () => void;
  isDark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'CycleSereine',
  subtitle,
  showLock = true,
  showStealth = true,
  onLockPress,
  onStealthPress,
  isDark = false,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const todayFormatted = CycleCalculator.formatFrenchDate(new Date(), 'EEEE d MMMM');

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
      <View style={styles.leftCol}>
        <View style={styles.brandRow}>
          <View style={[styles.iconCircle, { backgroundColor: colors.periodLight }]}>
            <Ionicons name="sparkles" size={16} color={colors.period} />
          </View>
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>{title}</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle || todayFormatted}
        </Text>
      </View>

      <View style={styles.rightActions}>
        {showStealth && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={onStealthPress}
            accessibilityLabel="Mode Furtif"
            activeOpacity={0.7}
          >
            <Ionicons name="eye-off-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {showLock && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={onLockPress}
            accessibilityLabel="Verrouiller l'application"
            activeOpacity={0.7}
          >
            <Ionicons name="lock-closed" size={17} color={colors.period} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  leftCol: {
    flex: 1,
  },
  brandRow: {
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
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
