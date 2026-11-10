import { Injectable, effect, signal } from '@angular/core';
import { Platform } from './sources';

/**
 * The company behind each platform: an authorization covers all of its players
 * (an X post and an X broadcast are both X).
 */
export type Provider = 'youtube' | 'twitch' | 'kick' | 'facebook' | 'x';

export interface ProviderInfo {
  label: string;
  /** The company's privacy policy, linked before the player is loaded. */
  privacyUrl: string;
}

export const PROVIDERS: Record<Provider, ProviderInfo> = {
  youtube: {
    label: 'YouTube (Google)',
    privacyUrl: 'https://policies.google.com/privacy',
  },
  twitch: { label: 'Twitch (Amazon)', privacyUrl: 'https://www.twitch.tv/p/legal/privacy-notice/' },
  kick: { label: 'Kick', privacyUrl: 'https://kick.com/privacy-policy' },
  facebook: { label: 'Facebook (Meta)', privacyUrl: 'https://www.facebook.com/privacy/policy/' },
  x: { label: 'X', privacyUrl: 'https://x.com/privacy' },
};

export function providerOf(platform: Platform): Provider {
  return platform === 'xBroadcast' ? 'x' : platform;
}

const STORAGE_KEY = 'mission-control:allowed';
const ALL = Object.keys(PROVIDERS) as Provider[];

/**
 * Which platforms the visitor allowed to load. The players come from the platforms' own servers,
 * which can set cookies and collect data as soon as they load, so nothing is loaded from a
 * platform until the visitor allows it. The choice is kept in this browser and can be withdrawn.
 */
@Injectable({ providedIn: 'root' })
export class ConsentStore {
  readonly allowed = signal<ReadonlySet<Provider>>(readAllowed());

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.allowed()]));
      } catch {
        // Storage can be unavailable (private mode); the choice lasts for this visit.
      }
    });
  }

  isAllowed(provider: Provider): boolean {
    return this.allowed().has(provider);
  }

  allow(provider: Provider) {
    this.allowed.update((set) => new Set(set).add(provider));
  }

  /** Withdraws every authorization: the players already on screen are unloaded. */
  revokeAll() {
    this.allowed.set(new Set());
  }
}

function readAllowed(): Set<Provider> {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(saved) ? ALL.filter((provider) => saved.includes(provider)) : []);
  } catch {
    return new Set();
  }
}
