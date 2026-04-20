import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { YouTubeService } from './youtube.service';

describe('YouTubeService', () => {
  let service: YouTubeService;
  let httpMock: HttpTestingController;

  const mockSearch = {
    items: [
      {
        id: { videoId: 'vid1' },
        snippet: {
          title: 'Hello World',
          description: 'A test video',
          channelTitle: 'Test Channel',
          publishedAt: '2024-01-01T00:00:00Z',
          thumbnails: { medium: { url: 'https://img.example.com/thumb.jpg' } },
        },
      },
    ],
  };

  const mockDetails = {
    items: [{ id: 'vid1', contentDetails: { duration: 'PT3M20S' } }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(YouTubeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('calls the search endpoint and video details endpoint', () => {
    let result: unknown;
    service.search('angular').subscribe(r => (result = r));

    const searchReq = httpMock.expectOne(r => r.url.includes('/search'));
    expect(searchReq.request.params.get('q')).toBe('angular');
    expect(searchReq.request.params.get('type')).toBe('video');
    searchReq.flush(mockSearch);

    const detailReq = httpMock.expectOne(r => r.url.includes('/videos'));
    expect(detailReq.request.params.get('id')).toBe('vid1');
    detailReq.flush(mockDetails);

    expect(result).toHaveLength(1);
    expect((result as { id: string }[])[0].id).toBe('vid1');
  });

  it('maps duration from detail response', () => {
    let result: { duration: string }[] = [];
    service.search('test').subscribe(r => (result = r));

    httpMock.expectOne(r => r.url.includes('/search')).flush(mockSearch);
    httpMock.expectOne(r => r.url.includes('/videos')).flush(mockDetails);

    expect(result[0].duration).toBe('3:20');
  });
});
