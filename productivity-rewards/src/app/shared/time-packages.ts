export const TIME_PACKAGES = [
  { minutes: 10,  coins: 10,  label: 'Starter' },
  { minutes: 20,  coins: 20,  label: 'Standard' },
  { minutes: 45, coins: 40,  label: 'Extended' },
  { minutes: 120, coins: 100, label: 'Marathon' },
] as const;

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function buildPackages(timeLabel: string) {
  return TIME_PACKAGES.map(p => ({
    ...p,
    description: `${formatMinutes(p.minutes)} of ${timeLabel}`,
  }));
}
