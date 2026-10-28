import { TestBed } from '@angular/core/testing';
import { Source } from './sources';
import { StreamsStore } from './streams.store';

const A = 'aaaaaaaaaaa';
const B = 'bbbbbbbbbbb';
const C = 'ccccccccccc';

const yt = (id: string): Source => ({ platform: 'youtube', id });

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
    expect(store.add(yt(A))).toBe(true);
    expect(store.add(yt(B))).toBe(true);
    expect(store.add(yt(A))).toBe(false);
    expect(store.streams().map((s) => [s.key, s.muted])).toEqual([
      [A, false],
      [B, true],
    ]);
  });

  it('solo unmutes one stream and mutes the rest', () => {
    const store = createStore();
    [A, B, C].forEach((id) => store.add(yt(id)));
    store.solo(C);
    expect(
      store
        .streams()
        .filter((s) => !s.muted)
        .map((s) => s.key),
    ).toEqual([C]);
  });

  it('promotes a stream without changing the DOM order', () => {
    const store = createStore();
    [A, B, C].forEach((id) => store.add(yt(id)));
    store.promote(C);
    expect(store.streams().map((s) => s.key)).toEqual([C, A, B]);
    expect(store.domOrder().map((s) => s.key)).toEqual([A, B, C]);
  });

  it('moves a stream to another position without changing the DOM order', () => {
    const store = createStore();
    [A, B, C].forEach((id) => store.add(yt(id)));
    store.move(A, 2);
    expect(store.streams().map((s) => s.key)).toEqual([B, C, A]);
    store.move(A, 1);
    expect(store.streams().map((s) => s.key)).toEqual([B, A, C]);
    store.move(C, -5);
    expect(store.streams().map((s) => s.key)).toEqual([C, B, A]);
    expect(store.domOrder().map((s) => s.key)).toEqual([A, B, C]);
  });

  it('keeps the new order in the share link and on the next visit', () => {
    const store = createStore();
    [A, B, C].forEach((id) => store.add(yt(id)));
    store.move(C, 0);
    expect(store.shareUrl()).toMatch(new RegExp(`#v=${C}%2C${A}%2C${B}$`));
    TestBed.tick();

    TestBed.resetTestingModule();
    expect(
      createStore()
        .streams()
        .map((s) => s.key),
    ).toEqual([C, A, B]);
  });

  it('restores streams from a shared link', () => {
    history.replaceState(null, '', `/#v=${A},${B},nope&layout=focus`);
    const store = createStore();
    expect(store.streams().map((s) => s.key)).toEqual([A, B]);
    expect(store.layout()).toBe('focus');
    expect(location.hash).toBe('');
  });

  it('builds a share link with the streams and layout', () => {
    const store = createStore();
    store.add(yt(A));
    store.add(yt(B));
    store.layout.set('stage');
    expect(store.shareUrl()).toMatch(new RegExp(`#v=${A}%2C${B}&layout=stage$`));
  });

  it('imports videos saved by the old version of the app', () => {
    localStorage.setItem('twoThreeVideos', JSON.stringify([A, null, B, null, null]));
    const store = createStore();
    expect(store.streams().map((s) => s.key)).toEqual([A, B]);
    expect(store.layout()).toBe('stage');
  });

  it('saves to localStorage and restores on the next visit', () => {
    const store = createStore();
    store.add(yt(A));
    store.add(yt(B));
    store.solo(B);
    TestBed.tick();

    TestBed.resetTestingModule();
    const restored = createStore();
    expect(restored.streams().map((s) => [s.key, s.muted])).toEqual([
      [A, true],
      [B, false],
    ]);
  });

  it('keeps X posts muted, since the page cannot control their sound', () => {
    const store = createStore();
    store.add({ platform: 'x', id: '1850000000000000000' });
    store.add({ platform: 'twitch', id: 'nasa' });
    expect(store.streams().map((s) => [s.key, s.muted])).toEqual([
      ['x:1850000000000000000', true],
      ['tw:nasa', false],
    ]);
  });

  it('shares and restores streams from different platforms', () => {
    const store = createStore();
    store.add(yt(A));
    store.add({ platform: 'twitch', id: 'nasa' });
    store.add({ platform: 'facebook', id: '1234567890123' });
    const hash = new URL(store.shareUrl()).hash;

    TestBed.resetTestingModule();
    localStorage.clear();
    history.replaceState(null, '', `/${hash}`);
    const restored = createStore();
    expect(restored.streams().map((s) => s.source)).toEqual([
      { platform: 'youtube', id: A },
      { platform: 'twitch', id: 'nasa' },
      { platform: 'facebook', id: '1234567890123' },
    ]);
  });
});
