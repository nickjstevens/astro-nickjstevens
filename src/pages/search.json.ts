import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  
  const searchData = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    url: `/blog/${post.id}/`,
    tags: post.data.tags,
    pubDate: post.data.pubDate.toISOString(),
  }));

  return new Response(JSON.stringify(searchData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}; 