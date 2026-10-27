import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-kick-embed',
  template: `<iframe
    class="fill"
    [src]="src()"
    allow="autoplay; fullscreen"
    allowfullscreen
  ></iframe>`,
  styleUrl: './embed.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KickEmbed {
  /** Channel name, already validated by parseSource(). */
  readonly id = input.required<string>();
  readonly muted = input(true);

  private readonly sanitizer = inject(DomSanitizer);

  // Kick's player has no API for sound, so toggling it reloads the player.
  protected readonly src = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://player.kick.com/${encodeURIComponent(this.id())}?autoplay=true&muted=${this.muted()}`,
    ),
  );
}
