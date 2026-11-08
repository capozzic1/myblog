import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { PostCard } from './components/post-card/post-card';
import { About } from './components/about/about';
import { Footer } from './components/footer/footer';
import { PostsService } from './data/posts.service';
import { BlogPost } from './data/blog-post';

@Component({
  selector: 'app-home',
  imports: [Header, Hero, PostCard, About, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly postsService = inject(PostsService);
  private readonly destroyRef = inject(DestroyRef);
  private page = 0;
  protected readonly posts = signal<readonly BlogPost[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly hasMore = signal(false);
  protected readonly latestPostUrl = computed(() => this.posts()[0] ? '/posts/' + this.posts()[0].slug : null);
  protected readonly searchOpen = signal(inject(ActivatedRoute).snapshot.queryParamMap.has('search'));
  protected readonly query = signal('');
  protected readonly filteredPosts = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.posts().filter(post =>
      `${post.title} ${post.category} ${post.excerpt}`.toLowerCase().includes(query));
  });

  constructor() { this.loadPosts(); }

  protected loadPosts(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(false);
    this.postsService.getPosts(this.page + 1).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.posts.update(posts => [...posts, ...result.posts]);
        this.hasMore.set(result.hasMore);
        this.page++;
        this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  protected toggleSearch(): void {
    this.searchOpen.update(open => !open);
    if (!this.searchOpen()) this.query.set('');
    setTimeout(() => {
      document.getElementById('posts')?.scrollIntoView({ block: 'start' });
      document.getElementById('post-search')?.focus();
    });
  }
}
