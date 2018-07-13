import { Observable, Subject, Observer } from 'rxjs'
import { share, first, filter, tap, debounceTime, switchMap } from 'rxjs/operators'
import * as moment from 'moment'
import { Stream, StreamConfig, StreamState } from './rxjs-audio.interfaces'
import { formatTime } from './rxjs-audio-utils'

export class AudioStream implements Stream {
  private audio: HTMLAudioElement = new Audio()
  private currentTrack: number = 0
  private audioInput: Array<string> = []
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
  ]
  private state: StreamState = {
    playing: false,
    isFirstTrack: false,
    isLastTrack: false,
    trackInfo: {
      currentTrack: undefined,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined
    }
  }
  private stateChange: Subject<any> = new Subject()
  private config: StreamConfig
  constructor(input: Array<any>, config?: StreamConfig | any) {
    this.config = config
    this.configureStream(this.config, input)
  }

  /**
   * Play the Audio Stream
   */
  play(): void {
    this.audio.play()
  }
  /**
   * Pause the Audio Stream
   */
  pause(): void {
    this.audio.pause()
  }
  /**
   * Stop the Audio Stream
   */
  stop(): void {
    this.audio.currentTime = 0
    this.audio.pause()
  }
  /**
   * Select the Next Audio Item in Playlist.
   * But it doens't play it automatically.
   * Run `play()` to play the stream
   */
  next(): void {
    if (!this.isLastPlaying()) {
      this.initAudio(++this.currentTrack)
    }
  }
  /**
   * Select the Previous Audio Item in Playlist.
   * But it doens't play it automatically.
   * Run `play()` to play the stream
   */
  previous(): void {
    if (!this.isFirstPlaying()) {
      this.initAudio(--this.currentTrack)
    }
  }
  /**
   * Method to Check if First Track is Playing or not
   * Alternatively you can `this.state()` Observable to get state.
   * state has `isFirstTrack:boolean` to check if First Track is playing or not
   */
  isFirstPlaying(): boolean {
    if (this.currentTrack === 0) {
      return true
    } else {
      return false
    }
  }
  /**
   * Method to Check if Last Track is Playing or not.
   * Alternatively you can `this.state()` Observable to get state.
   * state has `isLastTrack:boolean` to check if First Track is playing or not
   */
  isLastPlaying(): boolean {
    if (this.currentTrack === this.audioInput.length - 1) {
      return true
    } else {
      return false
    }
  }
  /**
   * Method to play track at particular index
   */
  playAt(index: number): void {
    if (index < this.audioInput.length) {
      this.initAudio(index)
      this.play()
    }
  }

  /**
   * Switch the currrent Track to particular index
   * It just switch the track, doesn't play the track.
   * To do switch and play, use `platAt()` method.
   */
  switchTo(index: number): void {
    if (index < this.audioInput.length) {
      this.initAudio(index)
    }
  }
  /**
   * Seek audio to particular time
   *
   * @param time
   */
  seekTo(time: number) {
    this.audio.currentTime = time
  }

  /**
   * Returns Observable which listens to audio events of audio stream
   */
  events(): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      const handler = (event: Event) => {
        observer.next(event)
        this.updateStateEvents(event)
      }
      this.addEvents(this.audio, this.audioEvents, handler)
      return () => {
        this.removeEvents(this.audio, this.audioEvents, handler)
      }
    }).pipe(share())
  }
  /**
   * Method to get stream of state updates
   */
  getState(): Subject<any> {
    return this.stateChange
  }
  /**
   * initialize the audio stream
   * internal implementation, don't use it.
   */
  private initAudio(index: number): void {
    /** reset the current audio */
    if (this.audio) {
      this.stop()
    }
    this.currentTrack = index
    this.audio.src = this.audioInput[this.currentTrack]
    this.audio.load()
    this.updateStateProps(this.state.trackInfo, 'currentTrack', this.currentTrack)
    this.updateStateProps(this.state, 'isFirstTrack', this.isFirstPlaying())
    this.updateStateProps(this.state, 'isLastTrack', this.isLastPlaying())
  }
  /**
   * method to add events listener for audio stream
   * internal implementation, don't use it.
   */
  private addEvents(obj: any, events: Array<string>, handler: any): void {
    events.forEach(event => {
      obj.addEventListener(event, handler)
    })
  }

  /**
   * method to remove events listeners for audio stream
   * internal implementation, don't use it.
   */
  private removeEvents(obj: any, events: Array<string>, handler: any): void {
    events.forEach(event => {
      obj.removeEventListener(event, handler)
    })
  }
  /**
   * method to update state from audio events
   * internal implementation, don't use it.
   */
  private updateStateEvents(event: Event): void {
    let trackInfo = this.state.trackInfo
    switch (event.type) {
      case 'canplay':
        trackInfo.duration = this.audio.duration
        trackInfo.readableDuration = formatTime(trackInfo.duration)
        this.state.playing = false
        break
      case 'playing':
        this.state.playing = true
        break
      case 'pause':
        this.state.playing = false
        break
      case 'timeupdate':
        trackInfo.currentTime = this.audio.currentTime
        trackInfo.readableCurrentTime = formatTime(trackInfo.currentTime)
        break
      case 'error':
        this.state.playing = false
        trackInfo.currentTime = 0
        trackInfo.duration = 0
        trackInfo.readableDuration = formatTime(trackInfo.duration)
        trackInfo.readableCurrentTime = formatTime(trackInfo.currentTime)
        break
    }
    this.stateChange.next(this.state)
  }

  /**
   * method to update state from properties
   * internal implementation, don't use it.
   */
  private updateStateProps(obj: any, prop: string, value: any): void {
    obj[prop] = value
    this.stateChange.next()
  }
  /**
   * extract tracks url from Array of tracks
   * internal implementation, don't use it.
   */
  private extractTracks(tracks: Array<any>, key: string): Array<string> {
    return tracks.map(track => {
      return track[key]
    })
  }

  /**
   * autoplay the next track if set in config
   * internal implementation, don't use it.
   */
  private autoPlayNext() {
    if (this.config && this.config.autoPlayNext) {
      this.next()
      this.play()
    }
  }

  /**
   * config the stream for initialization
   * internal implementation, don't use it.
   */
  private configureStream(config: StreamConfig, input: Array<any>) {
    let initialTrack
    /** if there is config available */
    /*  extract tracks from a list of track */
    if (config && config.urlKey) {
      this.audioInput = this.extractTracks(input, config.urlKey)
    } else {
      this.audioInput = input
    }

    /* set initial track based on user input */
    if (config && config.initialTrack) {
      initialTrack = config.initialTrack
    } else {
      initialTrack = 0
    }

    /** if there is no config, do the following  */
    if (!config) {
      initialTrack = 0
      this.audioInput = input
    }

    /* initialize audio **/
    this.initAudio(initialTrack)

    /** if autoPlayNext is set to true */
    const canPlay$ = this.events().pipe(filter((event: Event) => event.type === 'canplay'))
    const ended$ = this.events().pipe(filter((event: Event) => event.type === 'ended'))

    canPlay$.pipe(switchMap(event => ended$)).subscribe(value => this.autoPlayNext())
  }
}
