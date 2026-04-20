import { describe, it, expect } from 'vitest';
import { parseIsoDuration, mapSearchResponse } from './youtube.model';

describe('parseIsoDuration', () => {
  it('formats minutes and seconds', () => {
    expect(parseIsoDuration('PT4M32S')).toBe('4:32');
  });

  it('pads seconds with leading zero', () => {
    expect(parseIsoDuration('PT1M5S')).toBe('1:05');
  });

  it('formats hours with padded minutes and seconds', () => {
    expect(parseIsoDuration('PT1H2M3S')).toBe('1:02:03');
  });

  it('handles minutes only', () => {
    expect(parseIsoDuration('PT10M')).toBe('10:00');
  });

  it('handles seconds only', () => {
    expect(parseIsoDuration('PT45S')).toBe('0:45');
  });

  it('handles hours only', () => {
    expect(parseIsoDuration('PT2H')).toBe('2:00:00');
  });

  it('returns 0:00 for unrecognised string', () => {
    expect(parseIsoDuration('invalid')).toBe('0:00');
  });
});

describe('mapSearchResponse', () => {
  const searchRes = {
    items: [
      {
        id: { videoId: 'abc123' },
        snippet: {
          title: 'Test Video',
          description: 'A description',
          channelTitle: 'Test Channel',
          publishedAt: '2024-01-01T00:00:00Z',
          thumbnails: { medium: { url: 'https://img.example.com/thumb.jpg' } },
        },
      },
    ],
  };

  const detailRes = {
    items: [{ id: 'abc123', contentDetails: { duration: 'PT5M30S' } }],
  };

  it('maps search and detail responses into YouTubeVideo objects', () => {
    const result = mapSearchResponse(searchRes, detailRes);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'abc123',
      title: 'Test Video',
      description: 'A description',
      channelTitle: 'Test Channel',
      thumbnailUrl: 'https://img.example.com/thumb.jpg',
      duration: '5:30',
    });
  });

  it('falls back to — when duration is missing from detail response', () => {
    const result = mapSearchResponse(searchRes, { items: [] });
    expect(result[0].duration).toBe('—');
  });

  it('returns an empty array for empty search results', () => {
    expect(mapSearchResponse({ items: [] }, { items: [] })).toEqual([]);
  });
});
