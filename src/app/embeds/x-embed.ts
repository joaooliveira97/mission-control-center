import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { t } from '../i18n';
import { PLATFORMS } from '../sources';
import { loadScript } from './load-script';

// https://developer.x.com/en/docs/x-for-websites/javascript-api/overview
const SCRIPT = 'https://platform.twitter.com/widgets.js';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        createTweet(
          id: string,
          element: HTMLElement,
          options: Record<string, unknown>,
        ): Promise<HTMLElement | undefined>;
      };
      /** Runs callback once widgets.js has finished initialising. */
      ready?(callback: () => void): void;
    };
  }
}

/**
 * Embeds an X post. X has no video-only embed for posts, so this shows the whole post and its
 * video plays inside it when X allows it. Broadcasts have their own player (XBroadcastEmbed).
 */
@Component({
  selector: 'app-x-embed',
  template: `
    <div #target class="post" [hidden]="failed()"></div>
    @if (failed()) {
      <p class="fallback">
        {{ t.postFailed }}
        <a [href]="url()" target="_blank" rel="noopener">{{ t.openIn('X') }}</a>
      </p>
    }
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      overflow: auto;
      background: #000;
    }
    .post {
      width: min(100%, 550px);
    }
    .fallback {
      color: var(--muted);
      text-align: center;
    }
    a {
      color: var(--accent);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XEmbed {
  /** Post id. */
  readonly id = input.required<string>();

  private readonly target = viewChild.required<ElementRef<HTMLElement>>('target');
  protected readonly t = t;
  protected readonly failed = signal(false);
  protected readonly url = computed(() => PLATFORMS.x.url(this.id()));

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(async () => {
      try {
        await loadScript(SCRIPT);
        // The script loads before it has finished setting up; earlier calls can be ignored.
        await new Promise<void>((resolve) =>
          window.twttr?.ready ? window.twttr.ready(resolve) : resolve(),
        );
        if (destroyRef.destroyed) {
          return;
        }
        const post = await window.twttr!.widgets.createTweet(
          this.id(),
          this.target().nativeElement,
          { theme: 'dark', dnt: true, align: 'center', conversation: 'none' },
        );
        this.failed.set(!post);
      } catch {
        this.failed.set(true);
      }
    });
  }
}
