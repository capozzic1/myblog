import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: '<footer class="container"><span>© {{ year }} Chris </span><a href="#main">Back to top <span aria-hidden="true">↑</span></a></footer>',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
