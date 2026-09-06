import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';

interface SecurityBadgeProps {
  onPress?: () => void;
  isDark?: boolean;
}

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({ onPress, isDark = false }) => {
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#142E25' : '#EBFDF4',
          borderColor: isDark ? '#1F4F3F' : '#A7F3D0',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.badgeLeft}>
        <Ionicons name="shield-checkmark" size={15} color="#059669" />
        <Text style={[styles.badgeText, { color: isDark ? '#6EE7B7' : '#065F46' }]}>
          Chiffré AES-256 • Zéro Traceur • 100% Privé
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={isDark ? '#6EE7B7' : '#065F46'} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 18,
    marginVertical: 10,
  },
  badgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
