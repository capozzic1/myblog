import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PostPage } from './post-page';
import { wordpressPost } from './data/posts.testing';

describe('WordPress article', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ slug: 'the-next-step' })) } }],
    }).compileComponents();
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('loads a deep link, renders formatted content once, and sanitizes unsafe HTML', () => {
    const fixture = TestBed.createComponent(PostPage);
    TestBed.inject(HttpTestingController).expectOne(req => req.params.get('slug') === 'the-next-step').flush([
      wordpressPost({ content: { rendered: wordpressPost().content.rendered + '<script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(1)">Unsafe</a>' } }),
    ]);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain('The Next Step');
    expect(page.querySelectorAll('article img').length).toBe(1);
    expect(page.querySelector('article img')?.getAttribute('src')).toBe('/images/autumn-road.png');
    expect(page.querySelector('.wordpress-content ul li')?.textContent).toBe('Keep learning');
    expect(page.querySelector('article script')).toBeNull();
    expect(page.querySelector('article [onclick]')).toBeNull();
    expect(page.querySelector('article a')?.getAttribute('href')).not.toBe('javascript:alert(1)');
  });

  it('distinguishes failed requests from missing posts and supports retry', () => {
    const fixture = TestBed.createComponent(PostPage);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(req => req.params.has('slug')).flush('Unavailable', { status: 503, statusText: 'Service Unavailable' });
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('[role="alert"]')).toBeTruthy();
    (page.querySelector('main button') as HTMLButtonElement).click();
    http.expectOne(req => req.params.has('slug')).flush([]);
    fixture.detectChanges();
    expect(page.querySelector('h1')?.textContent).toBe('Post not found');
  });
});
