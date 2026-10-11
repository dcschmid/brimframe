import type { ImageMetadata } from 'astro';
import riffRacersLogo from '../assets/games/riff-racers/logo.png';

export interface Game {
  id: string;
  title: string;
  description: string;
  genre: string;
  status: string | null;
  gameSiteUrl: string | null;
  logo: ImageMetadata | null;
  artwork: ImageMetadata | null;
  artworkAlt: string;
}

export const games: readonly Game[] = [
  {
    id: 'riff-racers',
    title: 'Riff Racers',
    description:
      'Riff Racers is the arcade racer I’m working on. I’m building tracks with shortcuts and jumps, and tuning how the karts handle.',
    genre: 'Arcade Racing',
    status: 'In Development',
    gameSiteUrl: null,
    logo: riffRacersLogo,
    artwork: null,
    artworkAlt: '',
  },
];
