export interface SiteConfig {
  name: string;
  developerName: string;
  studioIntroduction: string;
  url: string;
  tagline: string;
  description: string;
  locale: string;
  language: string;
  country: string;
  contactEmail: string | null;
  contactUrl: string | null;
  socialImage: string | null;
  socialLinks: ReadonlyArray<{ label: string; url: string }>;
}

const developerName = 'Daniel Schmid';

export const site: SiteConfig = {
  name: 'BrimFrame',
  developerName,
  studioIntroduction: `BrimFrame is an independent solo game studio by ${developerName} in Germany.`,
  url: 'https://brimframe.de',
  tagline: 'Different Games. New Worlds. Same Passion.',
  description: `BrimFrame is an independent solo game studio by ${developerName} in Germany, currently developing the arcade racer Riff Racers.`,
  locale: 'en_GB',
  language: 'en',
  country: 'Germany',
  contactEmail: 'dcschmid@murena.io',
  contactUrl: null,
  socialImage: '/og-image.png',
  socialLinks: [],
};

// The V1 notice is implemented. Keep false until the production account,
// processing agreements and applicable legal obligations have been reviewed.
export const legal: {
  ready: boolean;
  businessName: string | null;
  representative: string | null;
  addressLines: string[];
  email: string | null;
  phone: string | null;
  vatId: string | null;
  registration: string | null;
} = {
  ready: false,
  businessName: site.developerName,
  representative: null,
  addressLines: ['Hiltenspergerstr. 78', '80796 München', 'Germany'],
  email: site.contactEmail,
  phone: null,
  vatId: null,
  registration: null,
};

export const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games/' },
  { label: 'About', href: '/about/' },
  { label: 'Devlog', href: '/devlog/' },
  { label: 'Contact', href: '/contact/' },
] as const;

export const contactHref = site.contactEmail
  ? `mailto:${site.contactEmail}`
  : site.contactUrl;
