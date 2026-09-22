// Real Scottish Fold cat audio files & Web Audio API fallback synthesizer

export type CatSoundStyle = 'classic' | 'kitten' | 'cute' | 'purr' | 'food';

// Audio file paths for real Scottish Fold & domestic cat recordings
const AUDIO_PATHS: Record<CatSoundStyle, string> = {
  classic: '/audio/scottish_fold_meow1.mp3',
  food: '/audio/scottish_fold_meow2.mp3',
  cute: '/audio/scottish_fold_cute.mp3',
  kitten: '/audio/scottish_fold_chirp.mp3',
  purr: '/audio/scottish_fold_purr.mp3',
};

// Preloaded Audio instances for instantaneous playback
const audioPool: Record<string, HTMLAudioElement[]> = {};

function getPreloadedAudio(style: CatSoundStyle): HTMLAudioElement {
  const url = AUDIO_PATHS[style] || AUDIO_PATHS.classic;
  if (!audioPool[url]) {
    audioPool[url] = [];
  }

  // Find an audio instance that is paused, or create a new one
  let audio = audioPool[url].find((a) => a.paused || a.ended);
  if (!audio) {
    audio = new Audio(url);
    audio.preload = 'auto';
    audioPool[url].push(audio);
  }
  return audio;
}

// Preload audio files when in browser
if (typeof window !== 'undefined') {
  try {
    Object.values(AUDIO_PATHS).forEach((path) => {
      const a = new Audio(path);
      a.preload = 'auto';
      if (!audioPool[path]) audioPool[path] = [];
      audioPool[path].push(a);
    });
  } catch {}
}

let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioCtx = new AudioCtxClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (e) {
    console.warn('AudioContext initialization failed:', e);
    return null;
  }
}

// Auto-unlock audio on user's first touch/click
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      // Warm up an audio element
      const testAudio = getPreloadedAudio('classic');
      testAudio.volume = 0.01;
      const playPromise = testAudio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            testAudio.pause();
            testAudio.currentTime = 0;
          })
          .catch(() => {});
      }
    } catch {}
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

/**
 * Play genuine recorded Scottish Fold cat vocalization
 */
export function playRealisticMeow(style: CatSoundStyle = 'classic', volume: number = 0.95) {
  try {
    // 1. Play genuine recorded Scottish Fold audio
    const audio = getPreloadedAudio(style);
    audio.currentTime = 0;
    audio.volume = Math.min(1, Math.max(0, volume));

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio play fallback to synthesis:', err);
        playSynthesizedMeow(style, volume);
      });
    }
  } catch (e) {
    console.warn('Real cat sound play failed, using synthesizer:', e);
    playSynthesizedMeow(style, volume);
  }
}

/**
 * Fallback Web Audio API cat synthesizer if real audio is blocked
 */
export function playSynthesizedMeow(style: CatSoundStyle = 'classic', volume: number = 0.55) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime + 0.01;

    let f0Start = 450;
    let f0Peak = 820;
    let f0End = 380;
    let duration = 0.52;
    let peakTime = 0.18;
    let lfoRate = 20;
    let lfoDepth = 18;

    if (style === 'kitten' || style === 'cute') {
      f0Start = 620;
      f0Peak = 1150;
      f0End = 520;
      duration = 0.38;
      peakTime = 0.14;
      lfoRate = 24;
      lfoDepth = 22;
    } else if (style === 'food') {
      f0Start = 480;
      f0Peak = 950;
      f0End = 420;
      duration = 0.6;
      peakTime = 0.22;
      lfoRate = 22;
      lfoDepth = 25;
    } else if (style === 'purr') {
      playCatPurrSound(volume);
      return;
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(volume * 0.45, now + 0.06);
    masterGain.gain.linearRampToValueAtTime(volume, now + peakTime);
    masterGain.gain.exponentialRampToValueAtTime(volume * 0.35, now + duration * 0.75);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterGain.connect(ctx.destination);

    const f1Filter = ctx.createBiquadFilter();
    f1Filter.type = 'bandpass';
    f1Filter.Q.setValueAtTime(3.8, now);
    f1Filter.frequency.setValueAtTime(450, now);
    f1Filter.frequency.exponentialRampToValueAtTime(950, now + peakTime);
    f1Filter.frequency.exponentialRampToValueAtTime(420, now + duration);

    const f2Filter = ctx.createBiquadFilter();
    f2Filter.type = 'bandpass';
    f2Filter.Q.setValueAtTime(4.2, now);
    f2Filter.frequency.setValueAtTime(1400, now);
    f2Filter.frequency.exponentialRampToValueAtTime(2350, now + peakTime);
    f2Filter.frequency.exponentialRampToValueAtTime(980, now + duration);

    f1Filter.connect(masterGain);
    f2Filter.connect(masterGain);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(lfoRate, now);
    lfoGain.gain.setValueAtTime(lfoDepth, now);
    lfo.connect(lfoGain);

    const voiceOsc = ctx.createOscillator();
    voiceOsc.type = 'sawtooth';
    voiceOsc.frequency.setValueAtTime(f0Start, now);
    voiceOsc.frequency.exponentialRampToValueAtTime(f0Peak, now + peakTime);
    voiceOsc.frequency.exponentialRampToValueAtTime(f0End, now + duration);
    lfoGain.connect(voiceOsc.frequency);

    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(f0Start * 0.98, now);
    subOsc.frequency.exponentialRampToValueAtTime(f0Peak * 0.98, now + peakTime);
    subOsc.frequency.exponentialRampToValueAtTime(f0End * 0.98, now + duration);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(volume * 0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    voiceOsc.connect(f1Filter);
    voiceOsc.connect(f2Filter);
    subOsc.connect(subGain);
    subGain.connect(masterGain);

    lfo.start(now);
    voiceOsc.start(now);
    subOsc.start(now);

    lfo.stop(now + duration + 0.05);
    voiceOsc.stop(now + duration + 0.05);
    subOsc.stop(now + duration + 0.05);
  } catch (err) {
    console.warn('Synthesized meow sound error:', err);
  }
}

/**
 * Realistic Cat Purr (Xirillash) sound
 */
export function playCatPurrSound(volume = 0.9) {
  try {
    const audio = getPreloadedAudio('purr');
    audio.currentTime = 0;
    audio.volume = Math.min(1, Math.max(0, volume));
    const p = audio.play();
    if (p) {
      p.catch(() => playSynthesizedPurr(volume));
    }
  } catch {
    playSynthesizedPurr(volume);
  }
}

function playSynthesizedPurr(volume = 0.5) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime + 0.01;
    const duration = 0.9;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(58, now);

    const tremolo = ctx.createOscillator();
    tremolo.type = 'sawtooth';
    tremolo.frequency.setValueAtTime(26, now);

    const tremoloGain = ctx.createGain();
    tremoloGain.gain.setValueAtTime(0.65, now);
    tremolo.connect(tremoloGain);

    const purrGain = ctx.createGain();
    purrGain.gain.setValueAtTime(0.001, now);
    purrGain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.15);
    purrGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    tremoloGain.connect(purrGain.gain);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);

    osc.connect(filter);
    filter.connect(purrGain);
    purrGain.connect(ctx.destination);

    osc.start(now);
    tremolo.start(now);
    osc.stop(now + duration);
    tremolo.stop(now + duration);
  } catch {}
}

/**
 * Main function used on mascot click, food sending, and welcome button:
 * Plays genuine recorded Scottish Fold meow + warm restaurant chime!
 */
export function playCatDeliverySound(style?: CatSoundStyle) {
  try {
    // 1. Play real Scottish Fold meow
    playRealisticMeow(style || 'food', 0.95);

    // 2. Play warm delivery chime in harmony with the meow
    setTimeout(() => {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime + 0.01;

        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(659.25, now); // E5
        chimeOsc.frequency.exponentialRampToValueAtTime(987.77, now + 0.15); // B5
        chimeOsc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.28); // E6

        chimeGain.gain.setValueAtTime(0.001, now);
        chimeGain.gain.linearRampToValueAtTime(0.18, now + 0.04);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(ctx.destination);

        chimeOsc.start(now);
        chimeOsc.stop(now + 0.4);
      } catch {}
    }, 280);
  } catch (e) {
    console.warn('Delivery sound failed:', e);
  }
}

