import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { YouTubePlayer } from '@angular/youtube-player';
import { hostSize } from '../element-size';
import { Icon } from '../icon';
import { Stream } from '../streams.store';

@Component({
  selector: 'app-stream-tile',
  imports: [YouTubePlayer, Icon],
  templateUrl: './stream-tile.html',
  styleUrl: './stream-tile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.audible]': '!stream().muted',
  },
})
export class StreamTile {
  readonly stream = input.required<Stream>();
  readonly canPromote = input(false);

  readonly muteToggled = output();
  readonly soloed = output();
  readonly promoted = output();
  readonly removed = output();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly player = viewChild.required(YouTubePlayer);
  private readonly ready = signal(false);

  /**
   * The YouTube player sizes its video from the size it is given, not from the iframe's CSS
   * size, so it has to be told the tile's real size or the video stays small inside the tile.
   */
  protected readonly size = hostSize();

  // Only read once: changing playerVars would recreate the iframe.
  protected readonly playerVars = computed<YT.PlayerVars>(() => ({
    autoplay: 1,
    playsinline: 1,
    rel: 0,
    mute: untracked(() => this.stream().muted) ? 1 : 0,
  }));

  constructor() {
    effect(() => {
      const muted = this.stream().muted;
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

  protected onReady() {
    this.ready.set(true);
  }

  protected fullscreen() {
    this.host.nativeElement.requestFullscreen?.();
  }
}
