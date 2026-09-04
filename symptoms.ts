import { FlowIntensity, MoodType, SymptomType, CervicalMucus, SelfCareActivity, SexDrive } from '../types';

export interface FlowInfo {
  id: FlowIntensity;
  label: string;
  icon: string;
  color: string;
  desc: string;
}

export const FLOW_OPTIONS: FlowInfo[] = [
  { id: 'spotting', label: 'Spotting', icon: 'water-outline', color: '#E8A3B2', desc: 'Légères pertes rosées ou brunes' },
  { id: 'light', label: 'Léger', icon: 'water', color: '#F27A95', desc: 'Flux doux, protège-slip ou cup légère' },
  { id: 'medium', label: 'Moyen', icon: 'water', color: '#E85B7A', desc: 'Flux normal régulier' },
  { id: 'heavy', label: 'Abondant', icon: 'water', color: '#D43F63', desc: 'Flux soutenu, protection renforcée' },
  { id: 'very_heavy', label: 'Très abondant', icon: 'water-sharp', color: '#A81C3D', desc: 'Flux très dense nécessitant du repos' },
];

export interface MoodInfo {
  id: MoodType;
  label: string;
  emoji: string;
  icon: string;
  category: 'positive' | 'gentle' | 'difficult';
}

export const MOOD_OPTIONS: MoodInfo[] = [
  { id: 'sereine', label: 'Sereine', emoji: '✨', icon: 'leaf-outline', category: 'positive' },
  { id: 'joyeuse', label: 'Joyeuse', emoji: '☀️', icon: 'sunny-outline', category: 'positive' },
  { id: 'calme', label: 'Calme & Zen', emoji: '🧘‍♀️', icon: 'flower-outline', category: 'gentle' },
  { id: 'energetique', label: 'Énergique', emoji: '⚡️', icon: 'flash-outline', category: 'positive' },
  { id: 'creative', label: 'Créative', emoji: '🎨', icon: 'color-palette-outline', category: 'positive' },
  { id: 'confiante', label: 'Confiante', emoji: '👑', icon: 'shield-checkmark-outline', category: 'positive' },
  { id: 'sensible', label: 'Sensible', emoji: '🥺', icon: 'heart-outline', category: 'gentle' },
  { id: 'amoureuse', label: 'Romantique', emoji: '💖', icon: 'heart-circle-outline', category: 'positive' },
  { id: 'irritable', label: 'Irritable', emoji: '⚡️', icon: 'thunderstorm-outline', category: 'difficult' },
  { id: 'anxieuse', label: 'Anxieuse', emoji: '🌪️', icon: 'cloudy-outline', category: 'difficult' },
  { id: 'epuisee', label: 'Épuisée', emoji: '😴', icon: 'bed-outline', category: 'difficult' },
  { id: 'triste', label: 'Mélancolique', emoji: '🌧️', icon: 'rainy-outline', category: 'difficult' },
];

export interface SymptomInfo {
  id: SymptomType;
  label: string;
  emoji: string;
  icon: string;
  category: 'pelvic' | 'general' | 'digestive' | 'mood_body';
}

export const SYMPTOM_OPTIONS: SymptomInfo[] = [
  { id: 'crampes', label: 'Crampes pelviennes', emoji: '🩹', icon: 'fitness-outline', category: 'pelvic' },
  { id: 'maux_tete', label: 'Maux de tête', emoji: '💆‍♀️', icon: 'headset-outline', category: 'general' },
  { id: 'migraine', label: 'Migraine intense', emoji: '⚡️', icon: 'flash-outline', category: 'general' },
  { id: 'poitrine_sensible', label: 'Seins tendus', emoji: '🌸', icon: 'heart-outline', category: 'pelvic' },
  { id: 'ballonnements', label: 'Ballonnements', emoji: '🎈', icon: 'ellipse-outline', category: 'digestive' },
  { id: 'fatigue', label: 'Fatigue intense', emoji: '🔋', icon: 'battery-dead-outline', category: 'general' },
  { id: 'lombalgies', label: 'Douleurs au dos', emoji: '🦴', icon: 'body-outline', category: 'pelvic' },
  { id: 'acne', label: 'Acné hormonale', emoji: '✨', icon: 'sparkles-outline', category: 'general' },
  { id: 'troubles_digestifs', label: 'Digestion lente', emoji: '☕️', icon: 'cafe-outline', category: 'digestive' },
  { id: 'bouffees_chaleur', label: 'Bouffées de chaleur', emoji: '🔥', icon: 'flame-outline', category: 'general' },
  { id: 'insomnie', label: 'Sommeil perturbé', emoji: '🌙', icon: 'moon-outline', category: 'general' },
  { id: 'nausees', label: 'Nausées', emoji: '🫧', icon: 'water-outline', category: 'digestive' },
  { id: 'fringales', label: 'Fringales sucrées', emoji: '🍫', icon: 'restaurant-outline', category: 'digestive' },
  { id: 'vertiges', label: 'Vertiges légers', emoji: '💫', icon: 'infinite-outline', category: 'general' },
  { id: 'douleurs_articulaires', label: 'Articulations sensibles', emoji: '🧊', icon: 'snow-outline', category: 'general' },
];

export interface CervicalMucusInfo {
  id: CervicalMucus;
  label: string;
  desc: string;
  fertilityLevel: 'low' | 'medium' | 'peak';
}

export const CERVICAL_MUCUS_OPTIONS: CervicalMucusInfo[] = [
  { id: 'dry', label: 'Sèche / Aucune', desc: 'Période peu fertile après les règles', fertilityLevel: 'low' },
  { id: 'sticky', label: 'Collante / Pâteuse', desc: 'Début de développement folliculaire', fertilityLevel: 'low' },
  { id: 'creamy', label: 'Crémeuse / Blanche', desc: 'Montée des œstrogènes', fertilityLevel: 'medium' },
  { id: 'egg_white', label: 'Blanc d’œuf filant', desc: 'Fertilité maximale (Pic ovulatoire)', fertilityLevel: 'peak' },
  { id: 'watery', label: 'Aqueuse & Fluide', desc: 'Très fertile et transparente', fertilityLevel: 'peak' },
];

export interface SelfCareInfo {
  id: SelfCareActivity;
  label: string;
  icon: string;
}

export const SELF_CARE_OPTIONS: SelfCareInfo[] = [
  { id: 'yoga', label: 'Yoga doux', icon: 'body-outline' },
  { id: 'marche', label: 'Marche en nature', icon: 'walk-outline' },
  { id: 'repos', label: 'Repos & Sieste', icon: 'bed-outline' },
  { id: 'meditation', label: 'Méditation & Respiration', icon: 'flower-outline' },
  { id: 'bain_chaud', label: 'Bain chaud relaxant', icon: 'water-outline' },
  { id: 'tisane', label: 'Tisane bienfaitrice', icon: 'cafe-outline' },
  { id: 'cardio', label: 'Séance cardio dynamique', icon: 'bicycle-outline' },
];

export const SEX_DRIVE_OPTIONS: { id: SexDrive; label: string; icon: string }[] = [
  { id: 'none', label: 'Absente', icon: 'remove-circle-outline' },
  { id: 'low', label: 'Calme', icon: 'heart-dislike-outline' },
  { id: 'medium', label: 'Modérée', icon: 'heart-outline' },
  { id: 'high', label: 'Élevée', icon: 'flame-outline' },
];
