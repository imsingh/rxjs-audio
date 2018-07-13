import { StreamConfig } from './rxjs-audio.interfaces'
import { AudioStream } from './rxjs-audio-stream'

export class RxJSAudioService {
  /**
   *
   * @param input Audio Track or List of Audio Tracks
   * @param config Configuration for Stream
   */
  create(input: any | Array<any>, config?: StreamConfig): AudioStream {
    let newInput = input
    /**
     * convert input:any to input:Array<any>
     */
    if (typeof newInput === 'string') {
      newInput = [input]
    }
    return new AudioStream(newInput, config)
  }
}
