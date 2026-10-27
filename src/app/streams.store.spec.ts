import { TestBed } from '@angular/core/testing';
import { StreamsStore } from './streams.store';

const A = 'aaaaaaaaaaa';
const B = 'bbbbbbbbbbb';
const C = 'ccccccccccc';

function createStore(): StreamsStore {
  return TestBed.inject(StreamsStore);
}

describe('StreamsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    history.replaceState(null, '', '/');
    TestBed.resetTestingModule();
  });

  it('only gives sound to the first stream and rejects duplicates', () => {
    const store = createStore();
    expect(store.add(A)).toBe(true);
    expect(store.add(B)).toBe(true);
    expect(store.add(A)).toBe(false);
    expect(store.streams().map((s) => [s.id, s.muted])).toEqual([
      [A, false],
      [B, true],
    ]);
  });

  it('solo unmutes one stream and mutes the rest', () => {
    const store = createStore();
    [A, B, C].forEach((id) => store.add(id));
    store.solo(C);
    expect(
      store
        .streams()
        .filter((s) => !s.muted)
        .map((s) => s.id),
    ).toEqual([C]);
  });

  it('promotes a stream without changing the DOM order', () => {
    const store = createStore();
    [A, B, C].forEach((id) => store.add(id));
    store.promote(C);
    expect(store.streams().map((s) => s.id)).toEqual([C, A, B]);
    expect(store.domOrder().map((s) => s.id)).toEqual([A, B, C]);
  });

  it('restores streams from a shared link', () => {
    history.replaceState(null, '', `/#v=${A},${B},nope&layout=focus`);
    const store = createStore();
    expect(store.streams().map((s) => s.id)).toEqual([A, B]);
    expect(store.layout()).toBe('focus');
    expect(location.hash).toBe('');
  });

  it('builds a share link with the streams and layout', () => {
    const store = createStore();
    store.add(A);
    store.add(B);
    store.layout.set('stage');
    expect(store.shareUrl()).toMatch(new RegExp(`#v=${A}%2C${B}&layout=stage$`));
  });

  it('imports videos saved by the old version of the app', () => {
    localStorage.setItem('twoThreeVideos', JSON.stringify([A, null, B, null, null]));
    const store = createStore();
    expect(store.streams().map((s) => s.id)).toEqual([A, B]);
    expect(store.layout()).toBe('stage');
  });

  it('saves to localStorage and restores on the next visit', () => {
    const store = createStore();
    store.add(A);
    store.add(B);
    store.solo(B);
    TestBed.tick();

    TestBed.resetTestingModule();
    const restored = createStore();
    expect(restored.streams().map((s) => [s.id, s.muted])).toEqual([
      [A, true],
      [B, false],
    ]);
  });
});
