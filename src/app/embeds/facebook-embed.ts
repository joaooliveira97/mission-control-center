import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { PLATFORMS } from '../sources';
import { loadScript } from './load-script';

// https://developers.facebook.com/docs/plugins/embedded-video-player/api
const SCRIPT = 'https://connect.facebook.net/en_US/sdk.js';
const API_VERSION = 'v23.0';

interface FacebookVideo {
  mute(): void;
  unmute(): void;
  play(): void;
}

interface XfbmlReady {
  type: string;
  id: string;
  instance: FacebookVideo;
}

interface FacebookSdk {
  init(options: Record<string, unknown>): void;
  XFBML: { parse(element: HTMLElement): void };
  Event: {
    subscribe(event: 'xfbml.ready', callback: (message: XfbmlReady) => void): void;
    unsubscribe(event: 'xfbml.ready', callback: (message: XfbmlReady) => void): void;
  };
}

declare global {
  interface Window {
    FB?: FacebookSdk;
  }
}

let initialized = false;
let nextId = 0;

async function loadSdk(): Promise<FacebookSdk> {
  await loadScript(SCRIPT);
  const sdk = window.FB!;
  if (!initialized) {
    sdk.init({ xfbml: false, version: API_VERSION });
    initialized = true;
  }
  return sdk;
}

@Component({
  selector: 'app-facebook-embed',
  template: `
    <div
      class="fb-video"
      [attr.id]="elementId"
      [attr.data-href]="href()"
      data-autoplay="true"
      data-allowfullscreen="true"
      data-show-text="false"
    ></div>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .fb-video {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacebookEmbed {
  /** Numeric video id. */
  readonly id = input.required<string>();
  readonly muted = input(true);

  protected readonly elementId = `fb-video-${nextId++}`;
  protected readonly href = computed(() => PLATFORMS.facebook.url(this.id()));

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly player = signal<FacebookVideo | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(async () => {
      const sdk = await loadSdk();
      if (destroyRef.destroyed) {
        return;
      }
      const onReady = (message: XfbmlReady) => {
        if (message.type === 'video' && message.id === this.elementId) {
          this.player.set(message.instance);
        }
      };
      sdk.Event.subscribe('xfbml.ready', onReady);
      destroyRef.onDestroy(() => sdk.Event.unsubscribe('xfbml.ready', onReady));
      sdk.XFBML.parse(this.host.nativeElement);
    });

    // Facebook always autoplays muted, so sound is applied once the player is ready.
    effect(() => {
      const muted = this.muted();
      const player = this.player();
      if (!player) {
        return;
      }
      if (muted) {
        player.mute();
      } else {
        player.unmute();
        player.play();
      }
    });
  }
}
