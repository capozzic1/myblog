import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, Subject, switchMap } from 'rxjs';
import { PostsService } from './data/posts.service';
import { BlogPost } from './data/blog-post';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-post-page',
  imports: [DatePipe, RouterLink, Header, Footer],
  template: `
    <a class="skip-link" href="#main">Skip to content</a>
    <app-header [isHome]="false" (searchRequested)="goToSearch()" />
    <main id="main" class="container article-page">
      <a class="back-link" routerLink="/" fragment="posts">← All posts</a>
      @if (state().loading) {
        <p role="status">Loading post…</p>
      } @else if (state().error) {
        <p role="alert">This post couldn’t be loaded. Please try again.</p>
        <button type="button" (click)="retry.next()">Try again</button>
      } @else if (state().post; as post) {
        <article>
          <p class="meta">{{ post.date | date:'MMMM d, y':'UTC' }} · {{ post.category }}</p>
          <h1>{{ post.title }}</h1>
          @if (post.showLeadImage) {
            <img [src]="post.image" [alt]="post.imageAlt" width="820" height="400" />
          }
          <div class="wordpress-content" [innerHTML]="post.contentHtml"></div>
        </article>
      } @else {
        <h1>Post not found</h1><p>That chapter hasn’t been written yet. Browse the latest posts to find something to read.</p>
      }
    </main>
    <app-footer />
  `,
  styles: `
    .article-page { max-width: 820px; min-height: 75vh; padding-block: 48px 72px; }
    .back-link { color: var(--accent); }
    h1 { font-size: clamp(32px, 5vw, 48px); letter-spacing: -1px; line-height: 1.15; margin: 16px 0; }
    p { color: var(--text-muted); font-size: 18px; line-height: 1.75; }
    .meta { font-size: 14px; margin-top: 36px; }
    button { color: var(--text); background: #171f26; border: 1px solid var(--border); border-radius: 6px; padding: 10px 18px; cursor: pointer; }
    img { width: 100%; height: auto; aspect-ratio: 2.05; object-fit: cover; border-radius: 10px; margin-block: 12px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostPage {
  private readonly router = inject(Router);
  private readonly postsService = inject(PostsService);
  protected readonly retry = new Subject<void>();
  protected readonly state = toSignal(inject(ActivatedRoute).paramMap.pipe(
    switchMap(params => this.retry.pipe(
      startWith(undefined),
      switchMap(() => this.postsService.getPost(params.get('slug') ?? '').pipe(
        map(post => ({ post, loading: false, error: false })),
        catchError(() => of({ post: null, loading: false, error: true })),
        startWith({ post: null, loading: true, error: false }),
      )),
    )),
  ), { initialValue: { post: null, loading: true, error: false } as { post: BlogPost | null; loading: boolean; error: boolean } });

  protected goToSearch(): void {
    void this.router.navigate(['/'], { queryParams: { search: 'true' }, fragment: 'posts' });
  }
}
