import { CyclePhase } from '../types';

export interface PhaseInsight {
  phase: CyclePhase;
  title: string;
  subtitle: string;
  badge: string;
  colorName: 'period' | 'follicular' | 'ovulation' | 'luteal' | 'pms';
  icon: string;
  hormones: string;
  energyLevel: string; // 'Douce & Introspection' | 'Énergie montante' | 'Rayonnement maximal' | 'Ancrage & Calme'
  nutritionTip: string;
  movementTip: string;
  mindsetTip: string;
  affirmation: string;
}

export const PHASE_INSIGHTS: Record<CyclePhase, PhaseInsight> = {
  menstrual: {
    phase: 'menstrual',
    title: 'Phase Menstruelle',
    subtitle: 'Hiver intérieur • Temps de régénération et de lâcher-prise',
    badge: 'Jour de repos sacré',
    colorName: 'period',
    icon: 'water',
    hormones: 'Œstrogènes et progestérone à leur niveau le plus bas.',
    energyLevel: 'Basse à Introspective',
    nutritionTip: 'Privilégiez les aliments riches en fer (lentilles, épinards), le magnésium et les bouillons chauds.',
    movementTip: 'Mouvements ultra-doux : étirements du bassin, yin yoga, marche lente ou simple repos au chaud.',
    mindsetTip: 'Honorez votre besoin de ralentir. Accordez-vous des pauses sans aucune culpabilité.',
    affirmation: 'Je m’écoute, je me repose et je régénère mon sanctuaire intérieur.',
  },
  follicular: {
    phase: 'follicular',
    title: 'Phase Folliculaire',
    subtitle: 'Printemps intérieur • Renouveau, élan créatif et vitalité',
    badge: 'Énergie montante',
    colorName: 'follicular',
    icon: 'leaf',
    hormones: 'Montée progressive des œstrogènes stimulant l’optimisme et la clarté d’esprit.',
    energyLevel: 'Haute & Enthousiaste',
    nutritionTip: 'Repas frais, graines germées, légumes croquants, protéines végétales et aliments fermentés.',
    movementTip: 'Moment idéal pour débuter de nouveaux entraînements, du renforcement ou de la course.',
    mindsetTip: 'Votre créativité est à son apogée : lancez de nouveaux projets et planifiez vos objectifs.',
    affirmation: 'Je m’éveille avec clarté, inspiration et confiance en mon potentiel.',
  },
  ovulation: {
    phase: 'ovulation',
    title: 'Phase Ovulatoire',
    subtitle: 'Été intérieur • Rayonnement, communication et fertilité',
    badge: 'Pic de magnétisme',
    colorName: 'ovulation',
    icon: 'sunny',
    hormones: 'Pic de LH et d’œstrogènes, brève montée de testostérone.',
    energyLevel: 'Maximale & Communicative',
    nutritionTip: 'Antioxydants, baies, poissons gras ou graines de lin, avocat et hydratation généreuse.',
    movementTip: 'HIIT, danse rythmée, séances intenses : profitez de votre endurance maximale.',
    mindsetTip: 'Votre charisme et votre facilité d’expression brillent : parfait pour négocier et partager.',
    affirmation: 'Je rayonne pleinement ma puissance et je m’exprime avec aisance.',
  },
  luteal: {
    phase: 'luteal',
    title: 'Phase Lutéale',
    subtitle: 'Automne intérieur • Ancrage, organisation et écoute de soi',
    badge: 'Ralentissement doux',
    colorName: 'luteal',
    icon: 'moon',
    hormones: 'La progestérone domine, apportant un effet calmant puis une sensibilité accrue.',
    energyLevel: 'Modérée & Structurée',
    nutritionTip: 'Glucides complexes (patates douces, avoine), chocolat noir riche en magnésium et tisanes.',
    movementTip: 'Pilates ciblé, renforcement doux, marche active et natation apaisante.',
    mindsetTip: 'Excellente phase pour finaliser les dossiers en cours, trier, ranger et poser ses limites.',
    affirmation: 'Je protège mon espace de sérénité et je respecte mon rythme naturel.',
  },
  pms: {
    phase: 'pms',
    title: 'Phase Prémenstruelle (SPM)',
    subtitle: 'Sensibilité accrue • Votre corps demande de la bienveillance',
    badge: 'Cocon & Douceur',
    colorName: 'pms',
    icon: 'sparkles',
    hormones: 'Chute rapide des hormones préparant le nouveau cycle.',
    energyLevel: 'Délicate & Émotive',
    nutritionTip: 'Limitez le sel, le café et le sucre raffiné pour réduire les crampes et l’irritabilité.',
    movementTip: 'Bain chaud au sel d’Epsom, postures de yoga pour ouvrir les hanches et respiration abdominale.',
    mindsetTip: 'Accueillez vos émotions comme des messagères bienveillantes sans vous juger.',
    affirmation: 'Je prends soin de moi avec tendresse et je m’accorde toute la douceur méritée.',
  },
};

export const PRIVACY_MANIFESTO = [
  {
    title: 'Chiffrement AES-256 de bout en bout',
    desc: 'Toutes vos données de cycle, symptômes et notes personnelles sont chiffrées localement sur votre appareil avant d’être enregistrées.',
    icon: 'lock-closed',
  },
  {
    title: 'Zéro traceurs & Aucune régie publicitaire',
    desc: 'CycleSereine ne contient aucun SDK commercial (ni Facebook, ni Google Analytics, ni Mixpanel). Vos données intimes ne sont JAMAIS monétisées.',
    icon: 'shield-checkmark',
  },
  {
    title: 'Verrouillage Biométrique & Code PIN',
    desc: 'Protégez l’accès à votre sanctuaire via Face ID, Touch ID ou un code secret avec verrouillage automatique instantané.',
    icon: 'finger-print',
  },
  {
    title: 'Mode Furtif & Déguisement d’icône',
    desc: 'En un clic ou avec un code PIN leurre, l’application se transforme en bloc-notes anodin pour préserver votre intimité en public.',
    icon: 'eye-off',
  },
  {
    title: 'Souveraineté Totale des Données (RGPD)',
    desc: 'Sauvegardes exportables chiffrées en un clic, synchronisation Supabase sans connaissance (Zero-Knowledge) et suppression définitive instantanée.',
    icon: 'cloud-offline',
  },
];
