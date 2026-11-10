import { t } from './i18n';

export type Platform = 'youtube' | 'twitch' | 'kick' | 'facebook' | 'x' | 'xBroadcast';

export interface Source {
  platform: Platform;
  /** YouTube video id, Twitch/Kick channel, Facebook video id, X post or broadcast id. */
  id: string;
}

interface PlatformInfo {
  label: string;
  /** Prefix used in saved state and share links. YouTube has none, for compatibility. */
  prefix: string;
  /** Whether the page can control this player's sound. */
  hasAudio: boolean;
  idPattern: RegExp;
  url: (id: string) => string;
}

export const PLATFORMS: Record<Platform, PlatformInfo> = {
  youtube: {
    label: 'YouTube',
    prefix: '',
    hasAudio: true,
    idPattern: /^[\w-]{11}$/,
    url: (id) => `https://www.youtube.com/watch?v=${id}`,
  },
  twitch: {
    label: 'Twitch',
    prefix: 'tw',
    hasAudio: true,
    idPattern: /^\w{3,25}$/,
    url: (id) => `https://www.twitch.tv/${id}`,
  },
  kick: {
    label: 'Kick',
    prefix: 'kick',
    hasAudio: true,
    idPattern: /^[\w-]{3,25}$/,
    url: (id) => `https://kick.com/${id}`,
  },
  facebook: {
    label: 'Facebook',
    prefix: 'fb',
    hasAudio: true,
    idPattern: /^\d{5,25}$/,
    url: (id) => `https://www.facebook.com/video.php?v=${id}`,
  },
  x: {
    label: 'X',
    prefix: 'x',
    hasAudio: false,
    idPattern: /^\d{5,25}$/,
    url: (id) => `https://x.com/i/status/${id}`,
  },
  xBroadcast: {
    label: 'X',
    prefix: 'xb',
    hasAudio: false,
    idPattern: /^[A-Za-z0-9]{8,20}$/,
    url: (id) => `https://x.com/i/broadcasts/${id}`,
  },
};

const PLATFORM_LIST = Object.keys(PLATFORMS) as Platform[];

/** First path segments on Twitch and Kick that are site pages, not channels. */
const RESERVED_CHANNELS = new Set([
  'browse',
  'categories',
  'category',
  'directory',
  'downloads',
  'following',
  'jobs',
  'p',
  'search',
  'settings',
  'subscriptions',
  'turbo',
  'videos',
]);

/** Stable string for a source, used as its identity, in storage and in share links. */
export function sourceKey(source: Source): string {
  const { prefix } = PLATFORMS[source.platform];
  return prefix ? `${prefix}:${source.id}` : source.id;
}

export function parseKey(key: string): Source | null {
  const separator = key.indexOf(':');
  const prefix = separator === -1 ? '' : key.slice(0, separator);
  const id = key.slice(separator + 1);
  const platform = PLATFORM_LIST.find((p) => PLATFORMS[p].prefix === prefix);
  return platform && PLATFORMS[platform].idPattern.test(id) ? { platform, id } : null;
}

function toUrl(input: string): URL | null {
  try {
    return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  } catch {
    return null;
  }
}

function hostOf(url: URL): string {
  return url.hostname.replace(/^(www|m|music|mobile|web)\./, '');
}

function source(platform: Platform, id: string | null | undefined): Source | null {
  return id && PLATFORMS[platform].idPattern.test(id) ? { platform, id } : null;
}

function channel(platform: Platform, url: URL): Source | null {
  const segments = url.pathname.split('/').filter(Boolean);
  const name = segments[0]?.toLowerCase();
  if (segments.length !== 1 || RESERVED_CHANNELS.has(name)) {
    return null;
  }
  return source(platform, name);
}

function youtube(url: URL): Source | null {
  if (hostOf(url) === 'youtu.be') {
    return source('youtube', url.pathname.split('/')[1]);
  }
  const fromQuery = url.searchParams.get('v');
  if (fromQuery) {
    return source('youtube', fromQuery);
  }
  const [, prefix, id] = url.pathname.split('/');
  return ['live', 'embed', 'shorts', 'v'].includes(prefix) ? source('youtube', id) : null;
}

function facebook(url: URL): Source | null {
  const fromQuery = url.searchParams.get('v');
  if (fromQuery) {
    return source('facebook', fromQuery);
  }
  // /{page}/videos/{id}, /{page}/videos/{slug}/{id} and /reel/{id}
  const segments = url.pathname.split('/').filter(Boolean);
  const marker = segments.findIndex((s) => s === 'videos' || s === 'reel');
  const id = marker === -1 ? undefined : segments.slice(marker + 1).find((s) => /^\d+$/.test(s));
  return source('facebook', id);
}

function x(url: URL): Source | null {
  const segments = url.pathname.split('/').filter(Boolean);
  // /i/broadcasts/{id}
  if (segments[0] === 'i' && segments[1] === 'broadcasts') {
    return source('xBroadcast', segments[2]);
  }
  // /{user}/status/{id} and /i/status/{id}
  const marker = segments.indexOf('status');
  return marker === -1 ? null : source('x', segments[marker + 1]);
}

/**
 * Turns anything a user is likely to paste into a source: a YouTube id or link,
 * a Twitch or Kick channel link, a Facebook video link, or an X post or broadcast link.
 */
export function parseSource(input: string): Source | null {
  const value = input.trim();
  if (PLATFORMS.youtube.idPattern.test(value)) {
    return { platform: 'youtube', id: value };
  }
  const url = toUrl(value);
  if (!url) {
    return null;
  }
  switch (hostOf(url)) {
    case 'youtube.com':
    case 'youtube-nocookie.com':
    case 'youtu.be':
      return youtube(url);
    case 'twitch.tv':
      return channel('twitch', url);
    case 'kick.com':
      return channel('kick', url);
    case 'facebook.com':
      return facebook(url);
    case 'x.com':
    case 'twitter.com':
      return x(url);
    default:
      return null;
  }
}

/** Explains why a link that looks almost right can't be used, when we know how to fix it. */
export function unsupportedHint(input: string): string | null {
  const url = toUrl(input.trim());
  if (!url) {
    return null;
  }
  if (hostOf(url) === 'fb.watch') {
    return t.fbWatchHint;
  }
  return null;
}
