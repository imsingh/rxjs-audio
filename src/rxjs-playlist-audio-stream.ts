import { filter, switchMap } from 'rxjs/operators';
import { AudioStream } from './rxjs-audio-stream';
import { PlaylistStreamConfig, PlaylistStreamState } from './rxjs-audio.interfaces';

export class PlaylistAudioStream extends AudioStream {
  protected state: PlaylistStreamState = {
    playing: false,
    isFirstTrack: false,
    isLastTrack: false,
    trackInfo: {
      currentTrack: undefined,
      duration: undefined,
      currentTime: undefined
    }
  };
  private currentTrackIndex: number = 0;
  private audioInput: Array<string> = [];

  constructor(input: Array<any>, config?: PlaylistStreamConfig | any) {
    super(config);

    this.configureStream(config, input);
  }

  /**
   * Select the Next Audio Item in Playlist.
   * But it doens't play it automatically.
   * Run `play()` to play the stream
   */
  next(): void {
    if (!this.isLastPlaying()) {
      this.loadTrackAtIndex(++this.currentTrackIndex);
    }
  }
  /**
   * Select the Previous Audio Item in Playlist.
   * But it doens't play it automatically.
   * Run `play()` to play the stream
   */
  previous(): void {
    if (!this.isFirstPlaying()) {
      this.loadTrackAtIndex(--this.currentTrackIndex);
    }
  }
  /**
   * Method to Check if First Track is Playing or not
   * Alternatively you can `this.state()` Observable to get state.
   * state has `isFirstTrack:boolean` to check if First Track is playing or not
   */
  isFirstPlaying(): boolean {
    if (this.currentTrackIndex === 0) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Method to Check if Last Track is Playing or not.
   * Alternatively you can `this.state()` Observable to get state.
   * state has `isLastTrack:boolean` to check if First Track is playing or not
   */
  isLastPlaying(): boolean {
    if (this.currentTrackIndex === this.audioInput.length - 1) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Method to play track at particular index
   */
  playAt(index: number): void {
    if (index < this.audioInput.length) {
      this.loadTrackAtIndex(index);
      this.play();
    }
  }

  /**
   * Switch the currrent Track to particular index
   * It just switch the track, doesn't play the track.
   * To do switch and play, use `platAt()` method.
   */
  switchTo(index: number): void {
    if (index < this.audioInput.length) {
      this.loadTrackAtIndex(index);
    }
  }

  /**
   * initialize the audio stream
   * internal implementation, don't use it.
   */
  private loadTrackAtIndex(index: number): void {
    this.currentTrackIndex = index;
    this.loadTrack(this.audioInput[index]);
    this.updateStateProps(this.state, 'isFirstTrack', this.isFirstPlaying());
    this.updateStateProps(this.state, 'isLastTrack', this.isLastPlaying());
  }

  /**
   * autoplay the next track if set in config
   * internal implementation, don't use it.
   */
  private autoPlayNext(config: PlaylistStreamConfig) {
    if (config && config.autoPlayNext) {
      this.next();
      this.play();
    }
  }

  /**
   * config the stream for initialization
   * internal implementation, don't use it.
   */
  private configureStream(config: PlaylistStreamConfig, input: Array<any>) {
    let initialTrack;
    /*  extract tracks from a list of track */
    this.audioInput = input;

    /* set initial track based on user input */
    if (config && config.initialTrack) {
      initialTrack = config.initialTrack;
    } else {
      initialTrack = 0;
    }

    /** if there is no config, do the following  */
    if (!config) {
      initialTrack = 0;
      this.audioInput = input;
    }

    /* initialize audio **/
    this.loadTrackAtIndex(initialTrack);

    /** if autoPlayNext is set to true */
    const canPlay$ = this.events().pipe(filter((event: Event) => event.type === 'canplay'));
    const ended$ = this.events().pipe(filter((event: Event) => event.type === 'ended'));

    canPlay$.pipe(switchMap(event => ended$)).subscribe(value => this.autoPlayNext(config));
  }
}
