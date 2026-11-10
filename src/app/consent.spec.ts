import { TestBed } from '@angular/core/testing';
import { ConsentStore, providerOf } from './consent';

describe('ConsentStore', () => {
  beforeEach(() => localStorage.clear());

  it('allows nothing until the visitor chooses', () => {
    const store = TestBed.inject(ConsentStore);
    expect(store.isAllowed('youtube')).toBe(false);
  });

  it('remembers the platforms the visitor allowed', () => {
    TestBed.inject(ConsentStore).allow('facebook');
    TestBed.tick();
    TestBed.resetTestingModule();
    const store = TestBed.inject(ConsentStore);
    expect(store.isAllowed('facebook')).toBe(true);
    expect(store.isAllowed('youtube')).toBe(false);
  });

  it('withdraws every authorization', () => {
    const store = TestBed.inject(ConsentStore);
    store.allow('x');
    store.revokeAll();
    expect(store.isAllowed('x')).toBe(false);
  });

  it('treats X posts and broadcasts as the same company', () => {
    expect(providerOf('xBroadcast')).toBe('x');
    expect(providerOf('x')).toBe('x');
  });
});
