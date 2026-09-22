// Web Audio API procedural 4D Food Sizzle & Woodfire Crackle sound synthesizer

let audioCtx: AudioContext | null = null;
let sizzleSourceNode: AudioNode | null = null;
let sizzleGainNode: GainNode | null = null;
let isSizzlePlaying = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Starts continuous realistic 4D sizzle (bubbling oil, searing meat on grill)
 */
export function startSizzleAudio(volume: number = 0.25): boolean {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (isSizzlePlaying) return true;

    // Buffer of pink/white noise for crackle
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Bandpass filter for sizzle high frequencies
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, ctx.currentTime);
    filter.Q.setValueAtTime(1.8, ctx.currentTime);

    // Highpass for crispy crackle
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(1200, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.3);

    whiteNoise.connect(filter);
    filter.connect(highpass);
    highpass.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();

    sizzleSourceNode = whiteNoise;
    sizzleGainNode = gain;
    isSizzlePlaying = true;
    return true;
  } catch (err) {
    console.warn('Sizzle audio error:', err);
    return false;
  }
}

/**
 * Stops continuous 4D sizzle
 */
export function stopSizzleAudio(): void {
  try {
    if (sizzleGainNode && audioCtx) {
      sizzleGainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      setTimeout(() => {
        if (sizzleSourceNode) {
          try {
            (sizzleSourceNode as AudioBufferSourceNode).stop();
            sizzleSourceNode.disconnect();
          } catch {}
          sizzleSourceNode = null;
        }
        sizzleGainNode = null;
        isSizzlePlaying = false;
      }, 250);
    } else {
      isSizzlePlaying = false;
    }
  } catch {
    isSizzlePlaying = false;
  }
}

export function isSizzleActive(): boolean {
  return isSizzlePlaying;
}
