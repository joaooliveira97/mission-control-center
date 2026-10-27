import { parseYouTubeId } from './youtube-id';

describe('parseYouTubeId', () => {
  const id = 'dQw4w9WgXcQ';

  it.each([
    id,
    `https://www.youtube.com/watch?v=${id}`,
    `https://www.youtube.com/watch?feature=share&v=${id}&t=42`,
    `youtube.com/watch?v=${id}`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://www.youtube.com/live/${id}?si=abc`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube.com/shorts/${id}`,
    `https://youtu.be/${id}`,
    `https://youtu.be/${id}?si=abc&t=10`,
    `  https://youtu.be/${id}  `,
  ])('extracts the id from %s', (input) => {
    expect(parseYouTubeId(input)).toBe(id);
  });

  it.each([
    '',
    'hello',
    'https://vimeo.com/123456',
    'https://www.youtube.com/@SpaceX',
    'https://www.youtube.com/watch?v=short',
    'https://example.com/watch?v=dQw4w9WgXcQ',
  ])('rejects %s', (input) => {
    expect(parseYouTubeId(input)).toBeNull();
  });
});
