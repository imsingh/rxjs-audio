# rxjs-audio
[![Build Status](https://travis-ci.org/imsingh/rxjs-audio.svg?branch=master)](https://travis-ci.org/imsingh/rxjs-audio)

Dead simple way to have audio playback functionality in the JS application.

Check out the [Demo App](https://imsingh.github.io/ngx-audio-app)

Check the [Documentation](https://imsingh.github.io/rxjs-audio)

# Table of contents:
- [Installation](#installation)
- [Usage](#usage)
    - [Creating a Stream](#creating-a-stream)
    - [Track Input and Configuration](#track-input-and-configuration)
    - [Audio Playback](#audio-playback)
    - [Listening to Audio Events](#listening-to-audio-events)
    - [Listening to State Changes](#listening-to-state-changes)
    - [Error Handling](#error-handling)
- [Documentation](#documentation)
- [License](#license)

## Instalation

```
# npm
npm install rxjs-audio --save
# yarn
yarn install rxjs-audio
```

## Usage

### Initialize the stream

Before using, you need to create an object of the Stream class. You'll need to pick a class depening on your use-case: 
- `AudioStream` is the base-class similar to the html5 audio element where you can load a track. 
- `PlaylistAudioStream` is like the name says more suitable for playing playlists, in the options you'll be able to add an array of tracks

```ts
import { AudioStream } from 'rxjs-audio-stream';
...

// For single track streams
const audioStream = new AudioStream();

// For playlists
const audioStream = new PlaylistAudioStream();
```
### Configuration

#### AudioStream

Starting or loading a single track

```ts

const audioStream = new AudioStream({
    // Optional
    autoPlay: true, // Start playing the track as soon as it loads
});

audioStream.loadTrack('https://ia801609.us.archive.org/16/items/nusratcollection_20170414_0953/Man%20Atkiya%20Beparwah%20De%20Naal%20Nusrat%20Fateh%20Ali%20Khan.mp3')

```

#### 2. Multi Track Input

```ts
const tracks: string[] = [
    'https://ia801504.us.archive.org/3/items/EdSheeranPerfectOfficialMusicVideoListenVid.com/Ed_Sheeran_-_Perfect_Official_Music_Video%5BListenVid.com%5D.mp3',
    'https://ia801609.us.archive.org/16/items/nusratcollection_20170414_0953/Man%20Atkiya%20Beparwah%20De%20Naal%20Nusrat%20Fateh%20Ali%20Khan.mp3',
    'https://ia801503.us.archive.org/15/items/TheBeatlesPennyLane_201805/The%20Beatles%20-%20Penny%20Lane.mp3',
];

const audioStream = new PlaylistAudioStream(tracks, {
    // Optional
    autoPlay: true, // Start playing the track as soon as it loads
    // Optional
    initialTrack: 1; // Set the track you want to start playing first
    // Optional
    autoPlayNext: true, // Automatically start playing the next song when a track finishes
});
```

## Audio Playback

`rxjs-audio` provides lots of playback features like `play`, `pause`, `next`, `previous` out of the box. Check documentation of `AudioStream` class for more detail.

#### Playing a stream

To `play` the media. Run the following:

```ts
this.audio.play();
```

#### Pausing a stream

To `pause` the media. Run the following:

```ts
this.audio.pause();
```

#### Stop a stream

To `stop` the media. Run the following:

```ts
this.audio.stop();
```

#### Seek to

To `seekTo` a position. Run the following:

```ts
this.audio.seekTo(20);
```

#### Change volume

To change the volume, use

```ts
this.audio.setVolume(0.5);
```

#### Playing `next` track (only for PlaylistAudioStream)

To play the `next` track in list. Run the following:

```ts
this.audio.next();
// Optional: Not required when `autoPlay` is set to true
this.audio.play();
```

Check the documentation at  and demo application for more detail.

### Listening to Audio Events

It's fairly easy to listen to audio media events like `playing`, `ended`. 

You just need to `subscribe` to the `Observable` return by `AudioStream.events()` method, as shown below:
```ts
this.audio.events()
.subscribe(event => {
    console.log(event);
});
```

### Listening to State Changes
`rxjs-audio` also provides an Observable to listen to state changes. You can use it as shown below:

```ts
// Update State
this.audio.getState()
.subscribe(state => {
    this.state = state;
});
```

The `state:StreamState` Object gives us folowing information:
```ts
{
    playing: boolean; // If media is currently playing or not.
    isFirstTrack: boolean; // (only for PlaylistAudioStream) If first track is playing or not.
    isLastTrack: boolean; // (only for PlaylistAudioStream) If last track is playing or not.
    trackInfo: StreamTrackInfo // Check the definition below
}
```

And `trackInfo:StreamTrackInfo` provide us following information:

```ts
{
    currentTrack: number | undefined, // index of the current playing track
    duration: number | undefined, // duration of media
    currentTime: number | undefined // currentTime of media
}
```

### Error Handling

Following is a very simple example of Error Handing

```ts
this.audio.events()
.subscribe(event => {
    if(event.type === 'canplay') {
        this.error = false;
    }
    else if(event.type === 'error') {
        this.error = true;
    }
});
```

## Documentation
Read the documentation at <https://imsingh.github.io/rxjs-audio> for more detail.

## License
Licensed under MIT

