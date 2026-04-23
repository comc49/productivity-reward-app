import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  YouTubeVideo,
  YouTubeSearchResponse,
  mapSearchResponse,
} from '../models/youtube.model';

const BASE = 'https://www.googleapis.com/youtube/v3';

@Injectable({ providedIn: 'root' })
export class YouTubeService {
  private http = inject(HttpClient);
  private apiKey = environment.youtubeApiKey;

  search(query: string, pageToken?: string): Observable<YouTubeVideo[]> {
    const searchParams = new HttpParams()
      .set('part', 'snippet')
      .set('type', 'video')
      .set('maxResults', '24')
      .set('q', query)
      .set('key', this.apiKey)
      .set('pageToken', pageToken ?? '');

    return this.http
      .get<YouTubeSearchResponse>(`${BASE}/search`, { params: searchParams })
      .pipe(
        switchMap(searchRes => {
          const ids = searchRes.items.map(i => i.id.videoId).join(',');
          const detailParams = new HttpParams()
            .set('part', 'contentDetails')
            .set('id', ids)
            .set('key', this.apiKey);

          return this.http
            .get<{ items: { id: string; contentDetails: { duration: string } }[] }>(
              `${BASE}/videos`,
              { params: detailParams },
            )
            .pipe(map(details => mapSearchResponse(searchRes, details)));
        }),
      );
  }
}
