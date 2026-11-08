import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  protected readonly expanded = signal(false);
  protected toggleDetails(): void { this.expanded.update(value => !value); }
}
