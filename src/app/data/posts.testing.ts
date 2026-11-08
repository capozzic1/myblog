import { WordPressPost } from './posts.service';

export function wordpressPost(overrides: Partial<WordPressPost> = {}): WordPressPost {
  return {
    id: 28,
    slug: 'the-next-step',
    date: '2026-11-07T00:48:53',
    date_gmt: '2026-11-07T00:48:53',
    title: { rendered: 'The Next Step &amp; What&#8217;s Next' },
    excerpt: { rendered: '<p>A new chapter&hellip;<a class="button" href="https://example.com">Read more</a></p>' },
    content: { rendered: '<figure><img src="https://i0.wp.com/localhost/images/autumn-road.png" alt="Autumn road" srcset="https://i0.wp.com/localhost/images/autumn-road.png?w=400 400w"></figure><p>It&#8217;s a new chapter.</p><ul><li>Keep learning</li></ul>' },
    _embedded: { 'wp:term': [[{ taxonomy: 'category', name: 'Life' }]] },
    ...overrides,
  };
}
