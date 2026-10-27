import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { PLATFORMS } from '../sources';
import { loadScript } from './load-script';

// https://developer.x.com/en/docs/x-for-websites/embedded-tweets/guides/embedded-tweet-javascript-factory-function
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
        /** The video-only embed. X no longer documents it, so it may not exist. */
        createVideo?(
          id: string,
          element: HTMLElement,
          options: Record<string, unknown>,
        ): Promise<HTMLElement | undefined>;
      };
    };
  }
}

/**
 * X has no documented video-only embed. This tries the old video embed first and
 * otherwise shows the whole post, whose video plays inside it when X allows it.
 * If neither loads, there's a link to X.
 */
@Component({
  selector: 'app-x-embed',
  template: `
    <div #target class="post" [hidden]="failed()"></div>
    @if (failed()) {
      <p class="fallback">
        Não foi possível mostrar este post.
        <a [href]="url()" target="_blank" rel="noopener">Abrir no X</a>
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
  protected readonly failed = signal(false);
  protected url() {
    return PLATFORMS.x.url(this.id());
  }

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(async () => {
      try {
        await loadScript(SCRIPT);
        if (destroyRef.destroyed) {
          return;
        }
        const widgets = window.twttr!.widgets;
        const element = this.target().nativeElement;
        const options = { theme: 'dark', dnt: true, align: 'center' };
        // Prefer the video on its own; fall back to the whole post, without the thread above it.
        const video = await widgets
          .createVideo?.(this.id(), element, options)
          .catch(() => undefined);
        if (!video) {
          element.replaceChildren();
        }
        const embed =
          video ??
          (await widgets.createTweet(this.id(), element, { ...options, conversation: 'none' }));
        this.failed.set(!embed);
      } catch {
        this.failed.set(true);
      }
    });
  }
}
