import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PRIVACY_MANIFESTO } from '../constants/educationalTips';
import { Colors } from '../constants/theme';

interface PrivacyInfoModalProps {
  visible: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const PrivacyInfoModal: React.FC<PrivacyInfoModalProps> = ({
  visible,
  onClose,
  isDark = false,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#059669" />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Sanctuaire de Confidentialité
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Engagement éthique & Chiffrement absolu
              </Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]} onPress={onClose}>
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Security statement banner */}
          <View style={[styles.banner, { backgroundColor: isDark ? '#1C3127' : '#ECFDF5', borderColor: isDark ? '#234C3C' : '#A7F3D0' }]}>
            <Ionicons name="lock-closed" size={24} color="#059669" />
            <Text style={[styles.bannerText, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
              Vos données gynécologiques vous appartiennent exclusivement. Aucun tiers, régie publicitaire ou serveur non autorisé ne peut y accéder.
            </Text>
          </View>

          {/* Core Pillars */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Nos 5 Piliers de Sécurité
          </Text>

          <View style={styles.pillarsList}>
            {PRIVACY_MANIFESTO.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.pillarCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={[styles.pillarIconBox, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name={item.icon as any} size={20} color={colors.accent} />
                </View>
                <View style={styles.pillarTextWrapper}>
                  <Text style={[styles.pillarTitle, { color: colors.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.pillarDesc, { color: colors.textSecondary }]}>
                    {item.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Supabase Zero-Knowledge Details */}
          <View style={[styles.zkBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.zkHeader}>
              <Ionicons name="cloud-done-outline" size={20} color="#38A3A5" />
              <Text style={[styles.zkTitle, { color: colors.textPrimary }]}>
                Architecture Zero-Knowledge Supabase
              </Text>
            </View>
            <Text style={[styles.zkBody, { color: colors.textSecondary }]}>
              Lorsque la synchronisation Supabase est activée, vos données sont chiffrées localement sur votre téléphone avec une clé AES-256 dérivée de votre sel privé avant tout envoi réseau. Même les administrateurs de bases de données ne stockent que du charabia illisible.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.understandBtn, { backgroundColor: colors.accent }]}
            onPress={onClose}
          >
            <Text style={styles.understandBtnText}>J'ai compris & Je me sens sereine</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  pillarsList: {
    gap: 12,
    marginBottom: 20,
  },
  pillarCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  pillarIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarTextWrapper: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  pillarDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  zkBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  zkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  zkTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  zkBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  understandBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  understandBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
