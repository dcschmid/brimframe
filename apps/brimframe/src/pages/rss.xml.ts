import type { APIContext } from 'astro';
import rss from '@astrojs/rss';
import { site } from '../config/site';
import { getPublishedPosts } from '../utils/devlog';

export const GET = async (context: APIContext) => {
  const posts = await getPublishedPosts();
  return rss({
    title: `${site.name} Devlog`,
    description: `Development notes from ${site.developerName} on making Riff Racers.`,
    site: context.site ?? new URL(site.url),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt ?? post.data.description,
      pubDate: post.data.publishDate,
      link: `/devlog/${post.id}/`,
      categories: post.data.tags,
      author: `${site.developerName} (${site.contactEmail ?? site.url})`,
    })),
    customData: `<language>${site.language}</language>`,
  });
};
