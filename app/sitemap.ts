import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/demo', '/book', '/privacy', '/cookies', '/terms', '/accessibility', '/legal'];
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/demo' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/demo' ? 0.8 : 0.6,
  }));
}
