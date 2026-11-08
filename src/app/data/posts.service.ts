import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { BlogPost } from './blog-post';

export const POSTS_URL = 'https://public-api.wordpress.com/wp/v2/sites/dreamcapsite.wordpress.com/posts';

export interface WordPressPost {
  id: number;
  slug: string;
  date: string;
  date_gmt?: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  jetpack_featured_media_url?: string;
  _embedded?: {
    'wp:featuredmedia'?: { source_url?: string; alt_text?: string }[];
    'wp:term'?: { taxonomy: string; name: string }[][];
  };
}

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  getPosts(page = 1) {
    return this.http.get<WordPressPost[]>(POSTS_URL, {
      params: { _embed: '1', page, per_page: 10, orderby: 'date', order: 'desc' },
      observe: 'response',
    }).pipe(map(response => ({
      posts: (response.body ?? []).map(post => this.mapPost(post)),
      hasMore: page < Number(response.headers.get('X-WP-TotalPages') ?? 1),
    })));
  }

  getPost(slug: string) {
    return this.http.get<WordPressPost[]>(POSTS_URL, {
      params: { _embed: '1', slug, per_page: 1 },
    }).pipe(map(posts => posts[0] ? this.mapPost(posts[0]) : null));
  }

  private mapPost(post: WordPressPost): BlogPost {
    const content = this.parseHtml(post.content.rendered);
    for (const image of content.content.querySelectorAll('img')) {
      const source = image.getAttribute('src') ?? '';
      const normalized = this.imageUrl(source);
      if (source !== normalized) {
        image.setAttribute('src', normalized);
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
      }
    }
    const firstImage = content.content.querySelector('img');
    const media = post._embedded?.['wp:featuredmedia']?.[0];
    const image = this.imageUrl(media?.source_url || post.jetpack_featured_media_url ||
      firstImage?.getAttribute('src') || '/images/cycling-sunset.png');
    const category = post._embedded?.['wp:term']?.flat().find(term => term.taxonomy === 'category');
    return {
      id: post.id,
      slug: post.slug,
      title: this.plainText(post.title.rendered),
      date: post.date_gmt ? `${post.date_gmt.replace(/Z$/, '')}Z` : post.date,
      category: category ? this.plainText(category.name) : 'Uncategorized',
      excerpt: this.plainText(post.excerpt.rendered, true),
      image,
      imageAlt: media?.alt_text || firstImage?.getAttribute('alt') || '',
      contentHtml: content.innerHTML,
      showLeadImage: !Array.from(content.content.querySelectorAll('img')).some(img => img.getAttribute('src') === image),
    };
  }

  private parseHtml(html: string): HTMLTemplateElement {
    // Template contents stay inert; Angular sanitizes HTML when it is rendered.
    const template = this.document.createElement('template');
    template.innerHTML = html;
    return template;
  }

  private plainText(html: string, removeReadMore = false): string {
    const template = this.parseHtml(html);
    template.content.querySelectorAll('script, style').forEach(element => element.remove());
    if (removeReadMore) {
      template.content.querySelectorAll('a.button, a.more-link').forEach(element => element.remove());
    }
    return (template.content.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  private imageUrl(source: string): string {
    // This legacy WordPress image points at localhost. Use the matching bundled
    // asset on every host; leave genuine WordPress media URLs untouched.
    try {
      const url = new URL(source);
      if ((['localhost', '127.0.0.1'].includes(url.hostname) && url.pathname === '/images/autumn-road.png') ||
        (/^i[0-3]\.wp\.com$/.test(url.hostname) && url.pathname === '/localhost/images/autumn-road.png')) {
        return '/images/autumn-road.png';
      }
    } catch { /* Relative asset URLs already point at this app. */ }
    return source;
  }
}
