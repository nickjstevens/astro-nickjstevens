import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  const adventures = await getCollection('adventures');
  
  const searchData = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      url: `/blog/${post.id}/`,
      tags: post.data.tags || [],
      pubDate: post.data.pubDate.toISOString(),
      type: 'blog'
    })),
    ...adventures.map((adventure) => ({
      title: adventure.data.title,
      description: adventure.data.description,
      url: adventure.data.kind === 'trip' 
        ? `/adventures/${adventure.data.tripSlug}/`
        : `/adventures/${adventure.data.tripSlug}/${adventure.id.split('/').pop()}/`,
      tags: [adventure.data.tripTitle, adventure.data.kind],
      pubDate: (adventure.data.date || new Date()).toISOString(),
      type: 'adventure'
    }))
  ];

  return new Response(JSON.stringify(searchData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}; 