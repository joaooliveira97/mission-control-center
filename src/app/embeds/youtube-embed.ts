import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
  selector: 'app-youtube-embed',
  imports: [YouTubePlayer],
  template: `
    <youtube-player
      class="fill"
      [videoId]="id()"
      [playerVars]="playerVars()"
      [disablePlaceholder]="true"
      (ready)="ready.set(true)"
    />
  `,
  styleUrl: './embed.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YouTubeEmbed {
  readonly id = input.required<string>();
  readonly muted = input(true);

  private readonly player = viewChild.required(YouTubePlayer);
  protected readonly ready = signal(false);

  // Only read once: changing playerVars would recreate the iframe.
  protected readonly playerVars = computed<YT.PlayerVars>(() => ({
    autoplay: 1,
    playsinline: 1,
    rel: 0,
    mute: untracked(this.muted) ? 1 : 0,
  }));

  constructor() {
    effect(() => {
      const muted = this.muted();
      if (!this.ready()) {
        return;
      }
      const player = this.player();
      if (muted) {
        player.mute();
      } else {
        player.unMute();
        player.playVideo();
      }
    });
  }
}
