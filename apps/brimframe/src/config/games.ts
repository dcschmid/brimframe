import type { ImageMetadata } from 'astro';
import riffRacersArtwork from '../assets/devlog/2026-10-grid-fights-back/grid-fights-back-hero.webp';
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
    artwork: riffRacersArtwork,
    artworkAlt:
      'Twelve karts racing from the Iron Chorus starting grid beneath the Riff Racers gantry.',
  },
];
