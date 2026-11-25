// All sound is synthesised with WebAudio: no audio files, no network.
// Every call is guarded so a missing or blocked AudioContext never breaks play.
export function createAudio() {
  let ctx = null;
  let muted = false;
  let sizzle = null;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
    return ctx;
  }

  function tone(freq, dur, type, vol, when = 0, slideTo = null) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    try {
      const t0 = ac.currentTime + when;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch {
      // Sound is garnish; never let it break the game.
    }
  }

  function noiseBurst(dur, vol, freq) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    try {
      const len = Math.floor(ac.sampleRate * dur);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ac.createBufferSource();
      src.buffer = buf;
      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = freq;
      const gain = ac.createGain();
      gain.gain.value = vol;
      src.connect(filter).connect(gain).connect(ac.destination);
      src.start();
    } catch {
      // Ignore.
    }
  }

  return {
    unlock() {
      const ac = ensure();
      if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.setSizzle(false);
      return muted;
    },
    isMuted() {
      return muted;
    },
    click() {
      tone(660, 0.07, 'triangle', 0.12);
    },
    pop() {
      tone(520, 0.09, 'sine', 0.16, 0, 880);
    },
    place() {
      noiseBurst(0.08, 0.14, 900);
      tone(300, 0.08, 'triangle', 0.1);
    },
    ready() {
      tone(880, 0.12, 'sine', 0.16);
      tone(1174, 0.16, 'sine', 0.16, 0.1);
    },
    serve() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'triangle', 0.16, i * 0.07));
      noiseBurst(0.12, 0.1, 2400);
    },
    error() {
      tone(180, 0.16, 'square', 0.08, 0, 120);
    },
    expire() {
      tone(392, 0.14, 'sawtooth', 0.07);
      tone(311, 0.22, 'sawtooth', 0.07, 0.13);
    },
    over() {
      [392, 330, 262, 196].forEach((f, i) => tone(f, 0.28, 'triangle', 0.14, i * 0.16));
    },
    /** A soft looping sizzle while anything cooks; call with false to stop it. */
    setSizzle(on) {
      const ac = ensure();
      if (!ac) return;
      try {
        if (on && !sizzle) {
          const len = ac.sampleRate;
          const buf = ac.createBuffer(1, len, ac.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
          const src = ac.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const filter = ac.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 3200;
          const gain = ac.createGain();
          gain.gain.value = muted ? 0 : 0.035;
          src.connect(filter).connect(gain).connect(ac.destination);
          src.start();
          sizzle = { src, gain };
        } else if (!on && sizzle) {
          sizzle.src.stop();
          sizzle.src.disconnect();
          sizzle = null;
        } else if (sizzle) {
          sizzle.gain.gain.value = muted ? 0 : 0.035;
        }
      } catch {
        sizzle = null;
      }
    },
  };
}
