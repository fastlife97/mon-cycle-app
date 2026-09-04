import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, useColorScheme, SafeAreaView, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StorageService, DEFAULT_PROFILE } from './src/services/storageService';
import { HomeScreen } from './src/screens/HomeScreen';
import { DailyLogScreen } from './src/screens/DailyLogScreen';
import { HistoryChartScreen } from './src/screens/HistoryChartScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { BiometricLockScreen } from './src/components/BiometricLockScreen';
import { StealthDisguiseView } from './src/components/StealthDisguiseView';
import { UserProfile, CycleRecord, DailyLog } from './src/types';
import { Colors } from './src/constants/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  const systemColorScheme = useColorScheme();
  
  // Preload vector icon fonts for web & native compatibility
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  // App States
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isStealthActive, setIsStealthActive] = useState<boolean>(false);
  const [targetLogDate, setTargetLogDate] = useState<string | undefined>(undefined);
  const [isReady, setIsReady] = useState<boolean>(false);

  const isDark =
    profile.darkMode === 'dark' || (profile.darkMode === 'system' && systemColorScheme === 'dark');
  const themeColors = isDark ? Colors.dark : Colors.light;

  // Load all encrypted data from local storage
  const loadAppData = useCallback(async () => {
    try {
      await StorageService.initStorage();
      const loadedProfile = await StorageService.getProfile();
      const loadedCycles = await StorageService.getCycles();
      const loadedLogs = await StorageService.getDailyLogs();

      setProfile(loadedProfile);
      setCycles(loadedCycles);
      setDailyLogs(loadedLogs);

      // If lock is disabled in settings, don't lock on launch
      if (!loadedProfile.security.hasPin && !loadedProfile.security.biometricEnabled) {
        setIsLocked(false);
      }
    } catch (e) {
      console.warn('Data load error:', e);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  const handleSaveDailyLog = async (log: DailyLog) => {
    await StorageService.saveDailyLog(log);
    await loadAppData();
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    await StorageService.saveProfile(newProfile);
    setProfile(newProfile);
  };

  const handleResetData = async () => {
    await StorageService.clearAllData();
    await loadAppData();
  };

  const handleLockApp = () => {
    setIsLocked(true);
    setIsStealthActive(false);
  };

  const handleEnterStealth = () => {
    setIsStealthActive(true);
  };

  const handleExitStealth = () => {
    setIsStealthActive(false);
  };

  if (!fontsLoaded || !isReady) {
    return null;
  }

  // 1. If Stealth Mode Disguise is active, show the fake Notes app
  if (isStealthActive) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F8F9FA' }]}>
        <StatusBar style="dark" />
        <StealthDisguiseView onExitStealth={handleExitStealth} />
      </SafeAreaView>
    );
  }

  // 2. If Locked, show Biometric / PIN Lock Screen
  if (isLocked) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <BiometricLockScreen
          securitySettings={profile.security}
          onUnlockSuccess={() => setIsLocked(false)}
          onStealthUnlock={() => {
            setIsLocked(false);
            setIsStealthActive(true);
          }}
          isDark={isDark}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: themeColors.surface,
              borderTopColor: themeColors.borderLight,
              borderTopWidth: 1,
              height: Platform.OS === 'ios' ? 86 : 64,
              paddingBottom: Platform.OS === 'ios' ? 24 : 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: themeColors.period,
            tabBarInactiveTintColor: themeColors.textMuted,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '700',
            },
          }}
        >
          <Tab.Screen
            name="Accueil"
            options={{
              tabBarLabel: 'Sanctuaire',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="sparkles-outline" size={size || 22} color={color} />
              ),
            }}
          >
            {(props) => (
              <HomeScreen
                {...props}
                cycles={cycles}
                dailyLogs={dailyLogs}
                profile={profile}
                onRefreshData={loadAppData}
                onLockApp={handleLockApp}
                onEnterStealth={handleEnterStealth}
                onNavigateToLog={(dateStr) => {
                  setTargetLogDate(dateStr);
                  props.navigation.navigate('Journal');
                }}
                isDark={isDark}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Journal"
            options={{
              tabBarLabel: 'Journal',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="journal-outline" size={size || 22} color={color} />
              ),
            }}
          >
            {(props) => (
              <DailyLogScreen
                {...props}
                initialDate={targetLogDate}
                dailyLogs={dailyLogs}
                onSaveLog={handleSaveDailyLog}
                onLockApp={handleLockApp}
                onEnterStealth={handleEnterStealth}
                isDark={isDark}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Tendances"
            options={{
              tabBarLabel: 'Historique',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="analytics-outline" size={size || 22} color={color} />
              ),
            }}
          >
            {(props) => (
              <HistoryChartScreen
                {...props}
                cycles={cycles}
                dailyLogs={dailyLogs}
                onLockApp={handleLockApp}
                onEnterStealth={handleEnterStealth}
                isDark={isDark}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Paramètres"
            options={{
              tabBarLabel: 'Sécurité',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="shield-checkmark-outline" size={size || 22} color={color} />
              ),
            }}
          >
            {(props) => (
              <SettingsScreen
                {...props}
                profile={profile}
                cycles={cycles}
                dailyLogs={dailyLogs}
                onUpdateProfile={handleUpdateProfile}
                onResetData={handleResetData}
                onLockApp={handleLockApp}
                onEnterStealth={handleEnterStealth}
                isDark={isDark}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
