import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { wordpressPost } from './data/posts.testing';

describe('Blog home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Home], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] }).compileComponents();
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('filters posts by category and handles no matching results', () => {
    const fixture = TestBed.createComponent(Home);
    TestBed.inject(HttpTestingController).expectOne(req => req.params.has('page')).flush([
      wordpressPost(),
      wordpressPost({ id: 29, slug: 'small-habits', title: { rendered: 'Small Habits' }, _embedded: { 'wp:term': [[{ taxonomy: 'category', name: 'Health' }]] } }),
      wordpressPost({ id: 30, slug: 'career', title: { rendered: 'Career' } }),
    ]);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelectorAll('app-post-card').length).toBe(3);
    (page.querySelector('button[aria-label="Search blog posts"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    const search = page.querySelector('input') as HTMLInputElement;
    search.value = 'health';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(page.querySelectorAll('app-post-card').length).toBe(1);
    expect(page.querySelector('app-post-card h3')?.textContent).toContain('Small Habits');
    search.value = 'no matching article';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(page.querySelectorAll('app-post-card').length).toBe(0);
    expect(page.querySelector('.empty-state')).toBeTruthy();
  });

  it('keeps the About section visible when no posts are published', () => {
    const fixture = TestBed.createComponent(Home);
    TestBed.inject(HttpTestingController).expectOne(req => req.params.has('page')).flush([]);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('app-about h2')?.textContent).toBe('About Me');
    expect(page.querySelector('app-about p')?.textContent).toContain('I’m Chris');
  });

  it('shows a loading state, retries errors, and handles an empty blog safely', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('[role="status"]')?.textContent).toContain('Loading');
    TestBed.inject(HttpTestingController).expectOne(req => req.params.has('page')).flush('Unavailable', { status: 503, statusText: 'Service Unavailable' });
    fixture.detectChanges();
    expect(page.querySelector('[role="alert"]')).toBeTruthy();
    (page.querySelector('.load-posts') as HTMLButtonElement).click();
    TestBed.inject(HttpTestingController).expectOne(req => req.params.get('page') === '1').flush([]);
    fixture.detectChanges();
    expect(page.querySelector('.empty-state')?.textContent).toContain('No posts published');
    expect(page.querySelector('app-hero a')?.getAttribute('href')).toBe('/#posts');
  });

  it('loads the next page without replacing earlier posts', () => {
    const fixture = TestBed.createComponent(Home);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(req => req.params.get('page') === '1').flush([wordpressPost()], { headers: { 'X-WP-TotalPages': '2' } });
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    (page.querySelector('.load-posts') as HTMLButtonElement).click();
    http.expectOne(req => req.params.get('page') === '2').flush([wordpressPost({ id: 29, slug: 'older-post' })], { headers: { 'X-WP-TotalPages': '2' } });
    fixture.detectChanges();
    expect(page.querySelectorAll('app-post-card').length).toBe(2);
    expect(page.querySelector('.load-posts')).toBeNull();
  });
});
