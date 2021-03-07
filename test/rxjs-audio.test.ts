import { AudioStream } from '../src/index';

/**
 * RxJSAudioService test
 */
describe('RxJSAudioService test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy();
  });

  it('RxJSAudioService is instantiable', () => {
    expect(new AudioStream()).toBeInstanceOf(AudioStream);
  });
});
