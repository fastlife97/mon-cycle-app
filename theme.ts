export const Colors = {
  light: {
    background: '#FAF6F6',
    surface: '#FFFFFF',
    surfaceSubtle: '#F6EFEF',
    surfaceElevated: '#FFFFFF',
    textPrimary: '#2E222A',
    textSecondary: '#7A6B74',
    textMuted: '#A99DA5',
    border: '#EFE5E7',
    borderLight: '#F7EDEF',
    
    // Cycle Phase Colors (Harmonious & Gentle)
    period: '#E85B7A',        // Rose framboise éclatant
    periodLight: '#FCE7EB',
    periodGradient: ['#F27A95', '#E85B7A'],
    
    follicular: '#4E9F8E',    // Sauge vivifiante
    follicularLight: '#E8F5F1',
    follicularGradient: ['#68BCA8', '#4E9F8E'],
    
    ovulation: '#E69C24',     // Ambre doré lumineux
    ovulationLight: '#FEF6E8',
    ovulationGradient: ['#F7B74A', '#E69C24'],
    
    luteal: '#9067C6',        // Lavande profonde
    lutealLight: '#F3EDFA',
    lutealGradient: ['#AB8AE2', '#9067C6'],
    
    pms: '#D97706',           // Pêche cuivrée
    pmsLight: '#FEF3C7',
    
    accent: '#E85B7A',
    accentLight: '#FFEBF0',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',

    // Security & Privacy Colors
    shield: '#3B82F6',
    shieldLight: '#EFF6FF',
    encrypted: '#10B981',
    encryptedLight: '#ECFDF5',
  },
  dark: {
    background: '#130F19',
    surface: '#1F1829',
    surfaceSubtle: '#2A2137',
    surfaceElevated: '#332943',
    textPrimary: '#F8F4F9',
    textSecondary: '#BDB1C4',
    textMuted: '#7D6F86',
    border: '#352B44',
    borderLight: '#261F33',
    
    period: '#FA6D8D',
    periodLight: '#3D1B28',
    periodGradient: ['#FA6D8D', '#D43F63'],
    
    follicular: '#54BAA6',
    follicularLight: '#183630',
    follicularGradient: ['#6BD2BE', '#45A593'],
    
    ovulation: '#FBBF24',
    ovulationLight: '#3D2F12',
    ovulationGradient: ['#FCD34D', '#E5A819'],
    
    luteal: '#A985E8',
    lutealLight: '#2D1F44',
    lutealGradient: ['#BC9EF0', '#956EDB'],
    
    pms: '#F59E0B',
    pmsLight: '#3A270D',
    
    accent: '#FA6D8D',
    accentLight: '#3D1B28',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    info: '#60A5FA',

    shield: '#60A5FA',
    shieldLight: '#1E293B',
    encrypted: '#34D399',
    encryptedLight: '#132E27',
  },
  stealth: {
    background: '#F4F5F7',
    surface: '#FFFFFF',
    surfaceSubtle: '#EBEDF0',
    surfaceElevated: '#FFFFFF',
    textPrimary: '#172B4D',
    textSecondary: '#5E6C84',
    textMuted: '#8993A4',
    border: '#DFE1E6',
    borderLight: '#EBECF0',
    
    period: '#42526E',
    periodLight: '#EBECF0',
    periodGradient: ['#505F79', '#42526E'],
    
    follicular: '#00875A',
    follicularLight: '#E3FCEF',
    follicularGradient: ['#36B37E', '#00875A'],
    
    ovulation: '#FF8B00',
    ovulationLight: '#FFEBE6',
    ovulationGradient: ['#FFAB00', '#FF8B00'],
    
    luteal: '#403294',
    lutealLight: '#EAE6FF',
    lutealGradient: ['#5243AA', '#403294'],
    
    pms: '#DE350B',
    pmsLight: '#FFEBE6',
    
    accent: '#0065FF',
    accentLight: '#DEEBFF',
    success: '#36B37E',
    warning: '#FFAB00',
    danger: '#FF5630',
    info: '#0065FF',

    shield: '#42526E',
    shieldLight: '#EBECF0',
    encrypted: '#00875A',
    encryptedLight: '#E3FCEF',
  }
};

export const Shadows = {
  soft: {
    shadowColor: '#2E222A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: '#2E222A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  }),
};
