export const ANALYTICS_CONSENT_KEY = 'brimframe.analytics-consent.v1';
export const ANALYTICS_CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;

export type AnalyticsChoice = 'accepted' | 'rejected';
export interface AnalyticsConsent {
  choice: AnalyticsChoice;
  updatedAt: number;
}

export function parseAnalyticsConsent(
  value: string | null,
  now = Date.now(),
): AnalyticsConsent | null {
  try {
    const consent: unknown = JSON.parse(value ?? 'null');
    if (
      typeof consent === 'object' &&
      consent !== null &&
      'choice' in consent &&
      (consent.choice === 'accepted' || consent.choice === 'rejected') &&
      'updatedAt' in consent &&
      typeof consent.updatedAt === 'number' &&
      Number.isFinite(consent.updatedAt) &&
      consent.updatedAt <= now &&
      now - consent.updatedAt < ANALYTICS_CONSENT_MAX_AGE
    ) {
      return { choice: consent.choice, updatedAt: consent.updatedAt };
    }
  } catch {
    // Missing, malformed or inaccessible preferences never enable analytics.
  }
  return null;
}
