import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { POSTS_URL, PostsService } from './posts.service';
import { wordpressPost } from './posts.testing';

describe('PostsService', () => {
  let service: PostsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PostsService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('maps WordPress HTML, category, UTC date, inline image, and pagination', () => {
    service.getPosts().subscribe(result => {
      const post = result.posts[0];
      expect(post.title).toBe('The Next Step & What’s Next');
      expect(post.excerpt).toBe('A new chapter…');
      expect(post.date).toBe('2026-11-07T00:48:53Z');
      expect(post.category).toBe('Life');
      expect(post.image).toBe('/images/autumn-road.png');
      expect(post.imageAlt).toBe('Autumn road');
      expect(post.contentHtml).toContain('<ul>');
      expect(post.contentHtml).not.toContain('localhost');
      expect(post.contentHtml).not.toContain('srcset');
      expect(post.showLeadImage).toBeFalse();
      expect(result.hasMore).toBeTrue();
    });
    const request = http.expectOne(req => req.url === POSTS_URL && req.params.get('page') === '1');
    expect(request.request.params.get('_embed')).toBe('1');
    request.flush([wordpressPost()], { headers: { 'X-WP-TotalPages': '2' } });
  });

  it('prefers featured media and leaves public WordPress image URLs intact', () => {
    service.getPost('the-next-step').subscribe(post => {
      expect(post?.image).toBe('https://example.wordpress.com/featured.jpg');
      expect(post?.imageAlt).toBe('Featured photo');
      expect(post?.showLeadImage).toBeTrue();
    });
    http.expectOne(req => req.params.get('slug') === 'the-next-step').flush([wordpressPost({
      _embedded: { 'wp:featuredmedia': [{ source_url: 'https://example.wordpress.com/featured.jpg', alt_text: 'Featured photo' }] },
    })]);
  });

  it('provides a fallback image and category when optional fields are absent', () => {
    service.getPosts(2).subscribe(result => {
      expect(result.posts[0].image).toBe('/images/cycling-sunset.png');
      expect(result.posts[0].category).toBe('Uncategorized');
      expect(result.hasMore).toBeFalse();
    });
    http.expectOne(req => req.params.get('page') === '2').flush([wordpressPost({
      _embedded: undefined, content: { rendered: '<p>No image.</p>' },
    })], { headers: { 'X-WP-TotalPages': '2' } });
  });

  it('returns null for an unknown slug', () => {
    service.getPost('missing').subscribe(post => expect(post).toBeNull());
    http.expectOne(req => req.params.get('slug') === 'missing').flush([]);
  });
});
