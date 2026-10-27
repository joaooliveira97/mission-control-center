import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Icon } from './icon';
import { planLayout } from './layout';
import { StreamTile } from './stream-tile/stream-tile';
import { Layout, StreamsStore } from './streams.store';
import { parseSource, unsupportedHint } from './sources';

/** Below this width the focus and stage layouts get too cramped, so the grid is used. */
const NARROW_WIDTH = 640;

@Component({
  selector: 'app-root',
  imports: [StreamTile, Icon],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly store = inject(StreamsStore);

  protected readonly layouts: { value: Layout; label: string; hint: string }[] = [
    { value: 'grid', label: 'Grelha', hint: 'Todos os vídeos com o mesmo tamanho' },
    { value: 'focus', label: 'Destaque', hint: 'Um vídeo grande e os outros ao lado' },
    { value: 'stage', label: 'Palco', hint: 'Dois vídeos grandes em cima e os restantes em baixo' },
  ];

  protected readonly error = signal('');
  protected readonly toast = signal('');
  protected readonly utc = signal(formatUtc(new Date()));

  private readonly wall = viewChild.required<ElementRef<HTMLElement>>('wall');
  private readonly wallSize = signal({ width: 1920, height: 1080 });

  protected readonly plan = computed(() => {
    const { width, height } = this.wallSize();
    const layout = width < NARROW_WIDTH ? 'grid' : this.store.layout();
    return planLayout(layout, this.store.count(), width, height);
  });

  /** Display position of each stream, keyed by id. */
  protected readonly positions = computed(
    () => new Map(this.store.streams().map((stream, index) => [stream.key, index])),
  );

  constructor() {
    const destroyRef = inject(DestroyRef);

    const clock = setInterval(() => this.utc.set(formatUtc(new Date())), 1000);
    destroyRef.onDestroy(() => clearInterval(clock));

    afterNextRender(() => {
      const observer = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        this.wallSize.set({ width, height });
      });
      observer.observe(this.wall().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected add(input: HTMLInputElement) {
    const value = input.value.trim();
    if (!value) {
      this.error.set('Cola o link de um direto ou vídeo.');
      return;
    }
    const source = parseSource(value);
    if (!source) {
      this.error.set(
        unsupportedHint(value) ??
          'Não reconheço esse link. Usa um link do YouTube, Twitch, Kick, Facebook ou X.',
      );
      return;
    }
    if (!this.store.add(source)) {
      this.error.set('Esse vídeo já está no ecrã.');
      return;
    }
    this.error.set('');
    input.value = '';
  }

  protected async share() {
    const url = this.store.shareUrl();
    try {
      await navigator.clipboard.writeText(url);
      this.flash('Link copiado. Quem o abrir vê estes vídeos.');
    } catch {
      prompt('Copia este link:', url);
    }
  }

  protected clear() {
    if (confirm('Remover todos os vídeos?')) {
      this.store.clear();
    }
  }

  protected toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  }

  private flash(message: string) {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 2500);
  }
}

function formatUtc(date: Date): string {
  return date.toISOString().slice(11, 19);
}
