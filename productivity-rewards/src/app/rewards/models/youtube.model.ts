export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration: string;
  publishedAt: string;
}

export interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
  nextPageToken?: string;
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { default?: { url: string }; medium?: { url: string } };
  };
}

interface YouTubeVideoDetailsResponse {
  items: YouTubeVideoDetailItem[];
}

interface YouTubeVideoDetailItem {
  id: string;
  contentDetails: { duration: string };
}

export function parseIsoDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = parseInt(match[1] ?? '0');
  const m = parseInt(match[2] ?? '0');
  const s = parseInt(match[3] ?? '0');
  const mm = String(m).padStart(h > 0 ? 2 : 1, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function mapSearchResponse(
  search: YouTubeSearchResponse,
  details: YouTubeVideoDetailsResponse,
): YouTubeVideo[] {
  const durationMap = new Map(
    (details.items ?? []).map(d => [d.id, parseIsoDuration(d.contentDetails.duration)]),
  );
  return (search.items ?? []).map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl: item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default?.url ?? '',
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    duration: durationMap.get(item.id.videoId) ?? '—',
  }));
}
