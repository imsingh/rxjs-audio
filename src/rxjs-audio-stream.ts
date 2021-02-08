import { Observable, Observer, Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { Stream, StreamConfig, StreamState } from './rxjs-audio.interfaces';

export class AudioStream implements Stream {
  protected state: StreamState = {
    playing: false,
    trackInfo: {
      currentTrack: undefined,
      duration: undefined,
      currentTime: undefined
    }
  };
  private audio: HTMLAudioElement = new Audio();
  private currentTrack: string = '';
  private audioEvents: Array<string> = [
    'ended',
    'error',
    'play',
    'playing',
    'pause',
    'timeupdate',
    'canplay',
    'loadedmetadata',
    'loadstart'
  ];
  private stateChange: Subject<any> = new Subject();
  private config: StreamConfig;
  constructor(config: StreamConfig = {}) {
    this.config = config;
  }

  /**
   * Play the Audio Stream
   */
  play(): void {
    this.audio.play();
  }
  /**
   * Pause the Audio Stream
   */
  pause(): void {
    this.audio.pause();
  }
  /**
   * Stop the Audio Stream
   */
  stop(): void {
    this.audio.currentTime = 0;
    this.audio.pause();
  }

  /**
   * Seek audio to particular time
   *
   * @param time
   */
  seekTo(time: number) {
    this.audio.currentTime = time;
  }

  /**
   * Set the audio stream volume
   *
   * @param volume
   */
  setVolume(volume: number) {
    this.audio.volume = volume;
  }

  /**
   * Mute the audio stream volume
   *
   * @param mute
   */
  setMute(muted: boolean) {
    this.audio.muted = muted;
  }

  /**
   * Set sinkId for this stream
   *
   * @param mute
   */
  setSinkId(deviceId: string) {
    if (!(this.audio as any).setSinkId) {
      throw new Error('setSinkId is not supported by this browser');
    }

    (this.audio as any).setSinkId(deviceId);
  }

  /**
   * Returns Observable which listens to audio events of audio stream
   */
  events(): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      const handler = (event: Event) => {
        observer.next(event);
        this.updateStateEvents(event);
      };
      this.addEvents(this.audio, this.audioEvents, handler);
      return () => {
        this.removeEvents(this.audio, this.audioEvents, handler);
      };
    }).pipe(share());
  }
  /**
   * Method to get stream of state updates
   */
  getState(): Subject<any> {
    return this.stateChange;
  }
  /**
   * load a new track
   */
  loadTrack(src: string): void {
    /** reset the current audio */
    if (this.audio) {
      this.stop();
    }
    this.currentTrack = src;
    this.audio.src = src;
    this.audio.autoplay = this.state.playing || this.config.autoPlay || false;
    this.audio.load();
    this.updateStateProps(this.state.trackInfo, 'currentTrack', this.currentTrack);
  }
  /**
   * method to add events listener for audio stream
   * internal implementation, don't use it.
   */
  protected addEvents(obj: any, events: Array<string>, handler: any): void {
    events.forEach(event => {
      obj.addEventListener(event, handler);
    });
  }

  /**
   * method to remove events listeners for audio stream
   * internal implementation, don't use it.
   */
  protected removeEvents(obj: any, events: Array<string>, handler: any): void {
    events.forEach(event => {
      obj.removeEventListener(event, handler);
    });
  }
  /**
   * method to update state from audio events
   * internal implementation, don't use it.
   */
  protected updateStateEvents(event: Event): void {
    let trackInfo = this.state.trackInfo;
    switch (event.type) {
      case 'canplay':
        trackInfo.duration = this.audio.duration;
        this.state.playing = false;
        break;
      case 'playing':
        this.state.playing = true;
        break;
      case 'pause':
        this.state.playing = false;
        break;
      case 'timeupdate':
        trackInfo.currentTime = this.audio.currentTime;
        break;
      case 'error':
        this.state.playing = false;
        trackInfo.currentTime = 0;
        trackInfo.duration = 0;
        break;
    }
    this.stateChange.next(this.state);
  }

  /**
   * method to update state from properties
   * internal implementation, don't use it.
   */
  protected updateStateProps(obj: any, prop: string, value: any): void {
    obj[prop] = value;
    this.stateChange.next();
  }
}
