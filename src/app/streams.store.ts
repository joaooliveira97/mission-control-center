import { Injectable, computed, effect, signal } from '@angular/core';

export type Layout = 'grid' | 'focus' | 'stage';

export const LAYOUTS: readonly Layout[] = ['grid', 'focus', 'stage'];

export interface Stream {
  id: string;
  muted: boolean;
  /** Insertion order. The DOM keeps this order so iframes never move and reload. */
  seq: number;
}

interface SavedState {
  ids: string[];
  unmuted: string[];
  layout: Layout;
}

const STORAGE_KEY = 'mission-control';
const LEGACY_KEYS = { freeGrid: 'freeGridVideos', twoThree: 'twoThreeVideos' };

@Injectable({ providedIn: 'root' })
export class StreamsStore {
  /** Streams in display order: the first one is the main stream in focus and stage layouts. */
  readonly streams = signal<Stream[]>([]);
  readonly layout = signal<Layout>('grid');

  readonly count = computed(() => this.streams().length);
  readonly domOrder = computed(() => [...this.streams()].sort((a, b) => a.seq - b.seq));
  readonly allMuted = computed(() => this.streams().every((s) => s.muted));

  private seq = 0;

  constructor() {
    const state = readHash() ?? readStorage() ?? readLegacyStorage();
    if (state) {
      this.restore(state);
    }
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.snapshot()));
      } catch {
        // Storage can be unavailable (private mode); the session still works.
      }
    });
  }

  /** Returns false when the stream is already on screen. */
  add(id: string): boolean {
    if (this.streams().some((s) => s.id === id)) {
      return false;
    }
    // Only the first stream starts with sound, so a full wall doesn't talk over itself.
    const muted = this.count() > 0;
    this.streams.update((list) => [...list, { id, muted, seq: this.seq++ }]);
    return true;
  }

  remove(id: string) {
    this.streams.update((list) => list.filter((s) => s.id !== id));
  }

  clear() {
    this.streams.set([]);
  }

  /** Moves a stream to the main slot. */
  promote(id: string) {
    this.streams.update((list) => {
      const stream = list.find((s) => s.id === id);
      return stream ? [stream, ...list.filter((s) => s !== stream)] : list;
    });
  }

  toggleMute(id: string) {
    this.streams.update((list) => list.map((s) => (s.id === id ? { ...s, muted: !s.muted } : s)));
  }

  /** Unmutes one stream and mutes all the others. */
  solo(id: string) {
    this.streams.update((list) => list.map((s) => ({ ...s, muted: s.id !== id })));
  }

  muteAll() {
    this.streams.update((list) => list.map((s) => (s.muted ? s : { ...s, muted: true })));
  }

  shareUrl(): string {
    const params = new URLSearchParams({
      v: this.streams()
        .map((s) => s.id)
        .join(','),
    });
    if (this.layout() !== 'grid') {
      params.set('layout', this.layout());
    }
    return `${location.origin}${location.pathname}#${params}`;
  }

  private snapshot(): SavedState {
    const streams = this.streams();
    return {
      ids: streams.map((s) => s.id),
      unmuted: streams.filter((s) => !s.muted).map((s) => s.id),
      layout: this.layout(),
    };
  }

  private restore(state: SavedState) {
    const ids = [...new Set(state.ids)];
    this.streams.set(
      ids.map((id) => ({ id, muted: !state.unmuted.includes(id), seq: this.seq++ })),
    );
    this.layout.set(state.layout);
  }
}

function asLayout(value: unknown): Layout {
  return LAYOUTS.includes(value as Layout) ? (value as Layout) : 'grid';
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && /^[\w-]{11}$/.test(value);
}

function readHash(): SavedState | null {
  const params = new URLSearchParams(location.hash.slice(1));
  const ids = (params.get('v') ?? '').split(',').filter(isId);
  if (ids.length === 0) {
    return null;
  }
  return { ids, unmuted: ids.slice(0, 1), layout: asLayout(params.get('layout')) };
}

function readJson(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

function readStorage(): SavedState | null {
  const saved = readJson(STORAGE_KEY) as Partial<SavedState> | null;
  if (!saved || !Array.isArray(saved.ids)) {
    return null;
  }
  const unmuted = Array.isArray(saved.unmuted) ? saved.unmuted : [];
  return {
    ids: saved.ids.filter(isId),
    unmuted: unmuted.filter(isId),
    layout: asLayout(saved.layout),
  };
}

/** Picks up videos saved by the original Angular 11 version of the app. */
function readLegacyStorage(): SavedState | null {
  const freeGrid = readJson(LEGACY_KEYS.freeGrid);
  if (Array.isArray(freeGrid) && freeGrid.some(isId)) {
    const ids = freeGrid.filter(isId);
    return { ids, unmuted: ids.slice(0, 1), layout: 'grid' };
  }
  const twoThree = readJson(LEGACY_KEYS.twoThree);
  if (Array.isArray(twoThree) && twoThree.some(isId)) {
    const ids = twoThree.filter(isId);
    return { ids, unmuted: ids.slice(0, 1), layout: 'stage' };
  }
  return null;
}
