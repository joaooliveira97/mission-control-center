const VIDEO_ID = /^[\w-]{11}$/;
const PATH_PREFIXES = ['live', 'embed', 'shorts', 'v'];

/**
 * Extracts the video id from anything a user is likely to paste: a bare id,
 * watch/live/embed/shorts links, youtu.be links, with or without the scheme.
 */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (VIDEO_ID.test(value)) {
    return value;
  }

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let candidate: string | null = null;
  if (host === 'youtu.be') {
    candidate = url.pathname.split('/')[1];
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    candidate = url.searchParams.get('v');
    if (!candidate) {
      const [, prefix, id] = url.pathname.split('/');
      candidate = PATH_PREFIXES.includes(prefix) ? id : null;
    }
  }

  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}
