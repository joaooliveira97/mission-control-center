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
        /** Turns widget markup (such as a blockquote) inside element into embeds. */
        load(element?: HTMLElement): Promise<unknown>;
      };
    };
  }
}

/**
 * Embeds from X. A broadcast (x.com/i/broadcasts/…) uses X's Broadcast widget, the one
 * publish.x.com generates, which shows just the live video. A post shows the whole post,
 * since X has no video-only embed for posts.
 */
@Component({
  selector: 'app-x-embed',
  template: `
    <div #target class="embed" [class.broadcast]="broadcast()" [hidden]="failed()"></div>
    @if (failed()) {
      <p class="fallback">
        Não foi possível mostrar isto aqui.
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
    .embed {
      width: min(100%, 550px);
    }
    .embed.broadcast {
      width: 100%;
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
  /** Post or broadcast id. */
  readonly id = input.required<string>();
  readonly broadcast = input(false);

  private readonly target = viewChild.required<ElementRef<HTMLElement>>('target');
  protected readonly failed = signal(false);
  protected readonly url = computed(() =>
    (this.broadcast() ? PLATFORMS.xBroadcast : PLATFORMS.x).url(this.id()),
  );

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
        if (this.broadcast()) {
          element.append(this.broadcastMarkup());
          await widgets.load(element);
          // The widget replaces the blockquote with an iframe when it works.
          this.failed.set(!(await waitForIframe(element, 10_000)));
        } else {
          const post = await widgets.createTweet(this.id(), element, {
            theme: 'dark',
            dnt: true,
            align: 'center',
            conversation: 'none',
          });
          this.failed.set(!post);
        }
      } catch {
        this.failed.set(true);
      }
    });
  }

  /** The markup publish.x.com generates for a broadcast, which widgets.js turns into a player. */
  private broadcastMarkup(): HTMLElement {
    const quote = document.createElement('blockquote');
    quote.className = 'twitter-broadcast';
    quote.dataset['broadcastId'] = this.id();
    quote.dataset['theme'] = 'dark';
    quote.dataset['dnt'] = 'true';
    const link = document.createElement('a');
    link.href = this.url();
    link.textContent = this.url();
    quote.append(link);
    return quote;
  }
}

function waitForIframe(element: HTMLElement, timeout: number): Promise<boolean> {
  if (element.querySelector('iframe')) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (element.querySelector('iframe')) {
        done(true);
      }
    });
    const timer = setTimeout(() => done(false), timeout);
    const done = (found: boolean) => {
      observer.disconnect();
      clearTimeout(timer);
      resolve(found);
    };
    observer.observe(element, { childList: true, subtree: true });
  });
}
