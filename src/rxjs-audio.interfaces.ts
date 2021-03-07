import { Observable, Subject } from 'rxjs';

/** interface for stream config */
export interface StreamConfig {
  autoPlay?: boolean;
}
export interface PlaylistStreamConfig extends StreamConfig {
  initialTrack?: number;
  autoPlayNext?: boolean;
}

/** interface for stream track info */
export interface StreamTrackInfo {
  currentTrack: number | undefined;
  duration: number | undefined;
  currentTime: number | undefined;
}

/** interface  for stream state */
export interface StreamState {
  playing: boolean;
  trackInfo: StreamTrackInfo;
}

export interface PlaylistStreamState extends StreamState {
  isFirstTrack: boolean;
  isLastTrack: boolean;
}

/** interface for stream */
export interface Stream {
  play(): void;
  pause(): void;
  stop(): void;
  seekTo(time: number): void;
  events(): Observable<any>;
  getState(): Subject<any>;
}
