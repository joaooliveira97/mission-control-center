import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { loadScript } from './load-script';

// https://dev.twitch.tv/docs/embed/video-and-clips/
const SCRIPT = 'https://player.twitch.tv/js/embed/v1.js';

interface TwitchPlayer {
  addEventListener(event: string, callback: () => void): void;
  setMuted(muted: boolean): void;
  play(): void;
}

interface TwitchPlayerClass {
  new (element: HTMLElement, options: Record<string, unknown>): TwitchPlayer;
  READY: string;
}

declare global {
  interface Window {
    Twitch?: { Player: TwitchPlayerClass };
  }
}

@Component({
  selector: 'app-twitch-embed',
  template: `<div #target class="fill"></div>`,
  styleUrl: './embed.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwitchEmbed {
  /** Channel name. */
  readonly id = input.required<string>();
  readonly muted = input(true);

  private readonly target = viewChild.required<ElementRef<HTMLElement>>('target');
  private readonly player = signal<TwitchPlayer | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(async () => {
      await loadScript(SCRIPT);
      if (destroyRef.destroyed) {
        return;
      }
      const Player = window.Twitch!.Player;
      const player = new Player(this.target().nativeElement, {
        channel: this.id(),
        // Twitch refuses to play unless it is told which site embeds it.
        parent: [location.hostname],
        width: '100%',
        height: '100%',
        autoplay: true,
        muted: untracked(this.muted),
      });
      player.addEventListener(Player.READY, () => this.player.set(player));
    });

    effect(() => {
      const muted = this.muted();
      const player = this.player();
      if (player) {
        player.setMuted(muted);
        if (!muted) {
          player.play();
        }
      }
    });
  }
}
