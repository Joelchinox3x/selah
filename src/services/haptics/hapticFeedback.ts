import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';

function canVibrate(): boolean {
  return useSettingsStore.getState().hapticsEnabled;
}

export function hapticSuccess(): void {
  if (canVibrate()) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
}

export function hapticWarning(): void {
  if (canVibrate()) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }
}

export function hapticLight(): void {
  if (canVibrate()) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

export function hapticMedium(): void {
  if (canVibrate()) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }
}

export function hapticSelection(): void {
  if (canVibrate()) {
    Haptics.selectionAsync().catch(() => {});
  }
}
