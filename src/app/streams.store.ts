import { Injectable, computed, effect, signal } from '@angular/core';
import { PLATFORMS, Source, parseKey, sourceKey } from './sources';

export type Layout = 'grid' | 'focus' | 'stage';

export const LAYOUTS: readonly Layout[] = ['grid', 'focus', 'stage'];

export interface Stream {
  /** See sourceKey(): unique per stream. */
  key: string;
  source: Source;
  muted: boolean;
  /** Insertion order. The DOM keeps this order so iframes never move and reload. */
  seq: number;
}

interface SavedState {
  /** Source keys, in display order. */
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
  add(source: Source): boolean {
    const key = sourceKey(source);
    if (this.streams().some((s) => s.key === key)) {
      return false;
    }
    // Only the first stream with sound starts unmuted, so a full wall doesn't talk over itself.
    const muted =
      !PLATFORMS[source.platform].hasAudio ||
      this.streams().some((s) => PLATFORMS[s.source.platform].hasAudio);
    this.streams.update((list) => [...list, { key, source, muted, seq: this.seq++ }]);
    return true;
  }

  remove(key: string) {
    this.streams.update((list) => list.filter((s) => s.key !== key));
  }

  clear() {
    this.streams.set([]);
  }

  /** Moves a stream to the main slot. */
  promote(key: string) {
    this.move(key, 0);
  }

  /** Moves a stream to another display position. Only CSS changes, so no iframe reloads. */
  move(key: string, index: number) {
    this.streams.update((list) => {
      const stream = list.find((s) => s.key === key);
      if (!stream) {
        return list;
      }
      const rest = list.filter((s) => s !== stream);
      const to = Math.max(0, Math.min(index, rest.length));
      return [...rest.slice(0, to), stream, ...rest.slice(to)];
    });
  }

  toggleMute(key: string) {
    this.streams.update((list) => list.map((s) => (s.key === key ? { ...s, muted: !s.muted } : s)));
  }

  /** Unmutes one stream and mutes all the others. */
  solo(key: string) {
    this.streams.update((list) => list.map((s) => ({ ...s, muted: s.key !== key })));
  }

  muteAll() {
    this.streams.update((list) => list.map((s) => (s.muted ? s : { ...s, muted: true })));
  }

  shareUrl(): string {
    const params = new URLSearchParams({
      v: this.streams()
        .map((s) => s.key)
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
      ids: streams.map((s) => s.key),
      unmuted: streams.filter((s) => !s.muted).map((s) => s.key),
      layout: this.layout(),
    };
  }

  private restore(state: SavedState) {
    const keys = [...new Set(state.ids)];
    this.streams.set(
      keys.map((key) => {
        const source = parseKey(key)!;
        const muted = !PLATFORMS[source.platform].hasAudio || !state.unmuted.includes(key);
        return { key, source, muted, seq: this.seq++ };
      }),
    );
    this.layout.set(state.layout);
  }
}

function asLayout(value: unknown): Layout {
  return LAYOUTS.includes(value as Layout) ? (value as Layout) : 'grid';
}

function isKey(value: unknown): value is string {
  return typeof value === 'string' && parseKey(value) !== null;
}

function isYouTubeId(value: unknown): value is string {
  return typeof value === 'string' && PLATFORMS.youtube.idPattern.test(value);
}

function readHash(): SavedState | null {
  const params = new URLSearchParams(location.hash.slice(1));
  const ids = (params.get('v') ?? '').split(',').filter(isKey);
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
    ids: saved.ids.filter(isKey),
    unmuted: unmuted.filter(isKey),
    layout: asLayout(saved.layout),
  };
}

/** Picks up videos saved by the original Angular 11 version of the app. */
function readLegacyStorage(): SavedState | null {
  const freeGrid = readJson(LEGACY_KEYS.freeGrid);
  if (Array.isArray(freeGrid) && freeGrid.some(isYouTubeId)) {
    const ids = freeGrid.filter(isYouTubeId);
    return { ids, unmuted: ids.slice(0, 1), layout: 'grid' };
  }
  const twoThree = readJson(LEGACY_KEYS.twoThree);
  if (Array.isArray(twoThree) && twoThree.some(isYouTubeId)) {
    const ids = twoThree.filter(isYouTubeId);
    return { ids, unmuted: ids.slice(0, 1), layout: 'stage' };
  }
  return null;
}
