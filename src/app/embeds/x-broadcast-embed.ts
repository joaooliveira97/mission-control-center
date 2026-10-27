import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * X broadcasts (x.com/i/broadcasts/…) embedded through studio.x.com, the player that X's
 * Broadcast widget (publish.x.com) loads. Using it directly avoids widgets.js, which only
 * rendered broadcasts after the tab had been hidden and shown again, and lets the player
 * fill the tile instead of the widget's fixed size.
 */
@Component({
  selector: 'app-x-broadcast-embed',
  template: `<iframe
    class="fill"
    title="X Broadcast"
    [src]="src()"
    allow="autoplay; fullscreen"
    allowfullscreen
  ></iframe>`,
  styleUrl: './embed.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XBroadcastEmbed {
  /** Broadcast id, already validated by parseSource(). */
  readonly id = input.required<string>();

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly src = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://studio.x.com/embed/broadcast/${encodeURIComponent(this.id())}?dnt=true&lang=pt`,
    ),
  );
}
