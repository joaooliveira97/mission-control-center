import { Source, parseKey, parseSource, sourceKey, unsupportedHint } from './sources';

describe('parseSource', () => {
  const yt = 'dQw4w9WgXcQ';

  it.each([
    yt,
    `https://www.youtube.com/watch?v=${yt}`,
    `https://www.youtube.com/watch?feature=share&v=${yt}&t=42`,
    `youtube.com/watch?v=${yt}`,
    `https://m.youtube.com/watch?v=${yt}`,
    `https://www.youtube.com/live/${yt}?si=abc`,
    `https://www.youtube.com/embed/${yt}`,
    `https://www.youtube.com/shorts/${yt}`,
    `https://youtu.be/${yt}`,
    `https://youtu.be/${yt}?si=abc&t=10`,
    `  https://youtu.be/${yt}  `,
  ])('reads YouTube link %s', (input) => {
    expect(parseSource(input)).toEqual({ platform: 'youtube', id: yt });
  });

  it.each<[string, Source]>([
    ['https://www.twitch.tv/NASA', { platform: 'twitch', id: 'nasa' }],
    ['twitch.tv/everyday_astronaut?sr=a', { platform: 'twitch', id: 'everyday_astronaut' }],
    ['https://kick.com/some-streamer', { platform: 'kick', id: 'some-streamer' }],
    [
      'https://www.facebook.com/NASA/videos/1234567890123/',
      { platform: 'facebook', id: '1234567890123' },
    ],
    [
      'https://www.facebook.com/NASA/videos/launch-day/1234567890123',
      { platform: 'facebook', id: '1234567890123' },
    ],
    [
      'https://www.facebook.com/watch/live/?v=1234567890123',
      { platform: 'facebook', id: '1234567890123' },
    ],
    [
      'https://www.facebook.com/watch/?v=1234567890123&ref=x',
      { platform: 'facebook', id: '1234567890123' },
    ],
    ['https://www.facebook.com/reel/1234567890123', { platform: 'facebook', id: '1234567890123' }],
    [
      'https://x.com/SpaceX/status/1850000000000000000',
      { platform: 'x', id: '1850000000000000000' },
    ],
    [
      'https://twitter.com/SpaceX/status/1850000000000000000?s=20',
      { platform: 'x', id: '1850000000000000000' },
    ],
    ['https://x.com/i/status/1850000000000000000', { platform: 'x', id: '1850000000000000000' }],
  ])('reads %s', (input, expected) => {
    expect(parseSource(input)).toEqual(expected);
  });

  it.each([
    '',
    'hello',
    'https://vimeo.com/123456',
    'https://www.youtube.com/@SpaceX',
    'https://www.youtube.com/watch?v=short',
    'https://example.com/watch?v=dQw4w9WgXcQ',
    'https://www.twitch.tv/directory',
    'https://www.twitch.tv/nasa/videos',
    'https://kick.com/browse',
    'https://www.facebook.com/NASA',
    'https://x.com/SpaceX',
    'https://x.com/i/broadcasts/1OyKAZVkLmvGb',
  ])('rejects %s', (input) => {
    expect(parseSource(input)).toBeNull();
  });
});

describe('source keys', () => {
  it.each<Source>([
    { platform: 'youtube', id: 'dQw4w9WgXcQ' },
    { platform: 'twitch', id: 'nasa' },
    { platform: 'kick', id: 'some-streamer' },
    { platform: 'facebook', id: '1234567890123' },
    { platform: 'x', id: '1850000000000000000' },
  ])('round-trips $platform', (source) => {
    expect(parseKey(sourceKey(source))).toEqual(source);
  });

  it('keeps bare YouTube ids, as saved by older versions', () => {
    expect(sourceKey({ platform: 'youtube', id: 'dQw4w9WgXcQ' })).toBe('dQw4w9WgXcQ');
  });

  it.each(['nope', 'tw:', 'zz:nasa', 'fb:abc'])('rejects %s', (key) => {
    expect(parseKey(key)).toBeNull();
  });
});

describe('unsupportedHint', () => {
  it('explains X broadcast links', () => {
    expect(unsupportedHint('https://x.com/i/broadcasts/1OyKAZVkLmvGb')).toContain('status');
  });

  it('explains fb.watch short links', () => {
    expect(unsupportedHint('https://fb.watch/abc123/')).toContain('endereço completo');
  });

  it('has nothing to say about unrelated links', () => {
    expect(unsupportedHint('https://vimeo.com/123')).toBeNull();
  });
});
