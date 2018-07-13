import { Observable, Subject } from 'rxjs'

/** interface for stream config */
export interface StreamConfig {
  urlKey?: string
  initialTrack?: number
  autoPlayNext?: boolean
}

/** interface for stream track info */
export interface StreamTrackInfo {
  currentTrack: number | undefined
  readableCurrentTime: string
  readableDuration: string
  duration: number | undefined
  currentTime: number | undefined
}

/** interface  for stream state */
export interface StreamState {
  playing: boolean
  isFirstTrack: boolean
  isLastTrack: boolean
  trackInfo: StreamTrackInfo
}

/** interface for stream */
export interface Stream {
  play(): void
  playAt(index: number): void
  switchTo(index: number): void
  pause(): void
  next(): void
  previous(): void
  stop(): void
  seekTo(time: number): void
  isFirstPlaying(): boolean
  isLastPlaying(): boolean
  events(): Observable<any>
  getState(): Subject<any>
}
