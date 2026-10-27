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
import { hostSize } from '../element-size';

@Component({
  selector: 'app-youtube-embed',
  imports: [YouTubePlayer],
  template: `
    <youtube-player
      [videoId]="id()"
      [playerVars]="playerVars()"
      [disablePlaceholder]="true"
      [width]="size()?.width"
      [height]="size()?.height"
      (ready)="ready.set(true)"
    />
  `,
  // The player is sized in pixels from this element (see size). Percentage sizes don't work:
  // the iframe sits inside wrapper divs with no height, so it fell back to 150px.
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    youtube-player ::ng-deep iframe {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YouTubeEmbed {
  readonly id = input.required<string>();
  readonly muted = input(true);

  private readonly player = viewChild.required(YouTubePlayer);
  protected readonly ready = signal(false);

  /**
   * The YouTube player sizes its video from the size it is given, not from the iframe's CSS
   * size, so it has to be told the real size or the video stays small inside the tile.
   */
  protected readonly size = hostSize();

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
