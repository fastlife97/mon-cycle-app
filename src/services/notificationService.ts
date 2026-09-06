import { NotificationSettings } from '../types';

export interface ScheduledReminder {
  id: string;
  title: string;
  body: string;
  triggerTime: string;
  type: 'period' | 'ovulation' | 'pms' | 'daily_log' | 'water';
  isDiscreet: boolean;
}

export class NotificationService {
  /**
   * Generates discrete and gentle reminder copy in French
   */
  public static getNotificationCopy(
    type: 'period' | 'ovulation' | 'pms' | 'daily_log',
    isDiscreet: boolean = true
  ): { title: string; body: string } {
    if (isDiscreet) {
      switch (type) {
        case 'period':
          return {
            title: 'CycleSereine • Cocon & Douceur',
            body: 'Un moment pour ralentir et écouter votre corps aujourd’hui 🌸',
          };
        case 'ovulation':
          return {
            title: 'CycleSereine • Rayonnement',
            body: 'Votre vitalité naturelle est à son zénith aujourd’hui ✨',
          };
        case 'pms':
          return {
            title: 'CycleSereine • Écoute de soi',
            body: 'Pensez à votre tisane chaude et accordez-vous une pause apaisante ☕️',
          };
        case 'daily_log':
          return {
            title: 'CycleSereine • Votre sanctuaire intime',
            body: '30 secondes pour déposer vos ressentis du jour en toute sécurité 🔒',
          };
      }
    }

    // Direct mode
    switch (type) {
      case 'period':
        return {
          title: 'CycleSereine • Prévision des règles',
          body: 'Vos règles sont prévues d’ici peu. Préparez vos protections favorites.',
        };
      case 'ovulation':
        return {
          title: 'CycleSereine • Fenêtre Fertile',
          body: 'Vous entrez dans votre période d’ovulation et de fertilité maximale.',
        };
      case 'pms':
        return {
          title: 'CycleSereine • Phase SPM',
          body: 'Début de la phase prémenstruelle : hydratez-vous et reposez-vous.',
        };
      case 'daily_log':
        return {
          title: 'CycleSereine • Journal du jour',
          body: 'Enregistrez votre flux, vos émotions et vos symptômes du jour.',
        };
    }
  }

  /**
   * Simulates scheduling upcoming gentle reminders
   */
  public static generateUpcomingReminders(settings: NotificationSettings): ScheduledReminder[] {
    if (!settings.enabled) return [];

    const reminders: ScheduledReminder[] = [];
    const isDiscreet = settings.discreetMode;

    if (settings.dailyLogReminder) {
      const copy = this.getNotificationCopy('daily_log', isDiscreet);
      reminders.push({
        id: 'daily_log_reminder',
        title: copy.title,
        body: copy.body,
        triggerTime: settings.reminderTime || '20:30',
        type: 'daily_log',
        isDiscreet,
      });
    }

    if (settings.periodReminderDaysBefore > 0) {
      const copy = this.getNotificationCopy('period', isDiscreet);
      reminders.push({
        id: 'period_reminder',
        title: copy.title,
        body: `${copy.body} (Dans ${settings.periodReminderDaysBefore} jours)`,
        triggerTime: '09:00',
        type: 'period',
        isDiscreet,
      });
    }

    if (settings.ovulationReminder) {
      const copy = this.getNotificationCopy('ovulation', isDiscreet);
      reminders.push({
        id: 'ovulation_reminder',
        title: copy.title,
        body: copy.body,
        triggerTime: '10:00',
        type: 'ovulation',
        isDiscreet,
      });
    }

    if (settings.pmsReminder) {
      const copy = this.getNotificationCopy('pms', isDiscreet);
      reminders.push({
        id: 'pms_reminder',
        title: copy.title,
        body: copy.body,
        triggerTime: '18:00',
        type: 'pms',
        isDiscreet,
      });
    }

    return reminders;
  }
}
