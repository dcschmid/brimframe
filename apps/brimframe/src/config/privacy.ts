// Provider information was checked against the linked official sources.
// Reassess this notice when accounts, providers or website services change.
export const privacy = {
  updatedDate: '2026-10-15',
  generalCorrespondenceRetentionMonths: 12,
  hosting: {
    name: 'Render Services, Inc.',
    country: 'United States',
    privacyUrl: 'https://render.com/privacy',
    dpaUrl: 'https://render.com/dpa',
    subprocessorsUrl: 'https://render.com/security',
  },
  email: {
    name: 'Murena Workspace',
    infrastructureUrl: 'https://murena.com/workspace/',
  },
  analytics: {
    name: 'Fathom Analytics',
    provider: 'Conva Ventures Inc.',
    country: 'Canada',
    privacyUrl: 'https://usefathom.com/legal/privacy',
    dpaUrl: 'https://usefathom.com/legal/dpa',
    dataJourneyUrl: 'https://usefathom.com/data',
    dataIsolationUrl: 'https://usefathom.com/features/data-isolation',
    retentionUrl: 'https://usefathom.com/',
  },
  supervisoryAuthority: {
    name: 'Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)',
    addressLines: ['Promenade 18', '91522 Ansbach', 'Germany'],
    email: 'poststelle@lda.bayern.de',
    contactUrl: 'https://www.lda.bayern.de/de/kontakt.html',
  },
} as const;
