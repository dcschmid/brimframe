import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { games } from './config/games';

const devlog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/devlog' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1).max(120),
        description: z.string().min(1).max(300),
        publishDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        heroImage: image().optional(),
        heroImageAlt: z.string().optional(),
        tags: z.array(z.string().min(1)).default([]),
        draft: z.boolean().default(true),
        game: z
          .string()
          .refine((id) => games.some((game) => game.id === id))
          .optional(),
        featured: z.boolean().default(false),
        slug: z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .optional(),
      })
      .refine((data) => !data.heroImage || Boolean(data.heroImageAlt?.trim()), {
        message: 'Provide descriptive heroImageAlt when a heroImage is used.',
        path: ['heroImageAlt'],
      })
      .refine(
        (data) => !data.updatedDate || data.updatedDate >= data.publishDate,
        {
          message: 'updatedDate must not precede publishDate.',
          path: ['updatedDate'],
        },
      ),
});

export const collections = { devlog };
