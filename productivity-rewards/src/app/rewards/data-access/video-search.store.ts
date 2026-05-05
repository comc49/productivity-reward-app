import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { YouTubeService } from './youtube.service';
import { YouTubeVideo } from '../models/youtube.model';

type VideoSearchState = {
  query: string;
  videos: YouTubeVideo[];
  lastQuery: string;
  hasSearched: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: VideoSearchState = {
  query: '',
  videos: [],
  lastQuery: '',
  hasSearched: false,
  loading: false,
  error: null,
};

export const VideoSearchStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, youtube = inject(YouTubeService)) => ({
    setQuery(query: string): void {
      patchState(store, { query });
    },

    async search(): Promise<void> {
      const q = store.query().trim();
      if (!q) return;

      patchState(store, { loading: true, error: null, videos: [], lastQuery: q });

      try {
        const results = await firstValueFrom(youtube.search(q));
        patchState(store, { videos: results });
      } catch (err: unknown) {
        console.error('YouTube search error:', err);
        const apiMsg = (err as { error?: { error?: { message?: string } } })?.error?.error?.message;
        const jsMsg = err instanceof Error ? err.message : null;
        patchState(store, { error: apiMsg ?? jsMsg ?? 'Failed to search. Check your YouTube API key.' });
      } finally {
        patchState(store, { loading: false, hasSearched: true });
      }
    },
  }))
);
