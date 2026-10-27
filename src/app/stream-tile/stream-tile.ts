import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { FacebookEmbed } from '../embeds/facebook-embed';
import { KickEmbed } from '../embeds/kick-embed';
import { TwitchEmbed } from '../embeds/twitch-embed';
import { XBroadcastEmbed } from '../embeds/x-broadcast-embed';
import { XEmbed } from '../embeds/x-embed';
import { YouTubeEmbed } from '../embeds/youtube-embed';
import { Icon } from '../icon';
import { PLATFORMS } from '../sources';
import { Stream } from '../streams.store';

@Component({
  selector: 'app-stream-tile',
  imports: [Icon, YouTubeEmbed, TwitchEmbed, KickEmbed, FacebookEmbed, XEmbed, XBroadcastEmbed],
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

  protected readonly platform = computed(() => PLATFORMS[this.stream().source.platform]);
  protected readonly url = computed(() => this.platform().url(this.stream().source.id));

  protected fullscreen() {
    this.host.nativeElement.requestFullscreen?.();
  }
}
