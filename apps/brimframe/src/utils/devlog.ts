import { getCollection } from 'astro:content';
import { selectPublished } from './publication';

export async function getPublishedPosts() {
  return selectPublished(await getCollection('devlog'));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
