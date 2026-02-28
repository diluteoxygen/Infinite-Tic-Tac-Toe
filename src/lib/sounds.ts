let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export type SoundType = "place" | "remove" | "win" | "error" | "join";

export function playSound(type: SoundType) {
  try {
    switch (type) {
      case "place":
        playTone(600, 0.1, "sine", 0.25);
        break;
      case "remove":
        playTone(400, 0.15, "sine", 0.15);
        setTimeout(() => playTone(300, 0.15, "sine", 0.1), 50);
        break;
      case "win":
        playTone(523, 0.15, "sine", 0.3);
        setTimeout(() => playTone(659, 0.15, "sine", 0.3), 100);
        setTimeout(() => playTone(784, 0.2, "sine", 0.3), 200);
        setTimeout(() => playTone(1047, 0.3, "sine", 0.3), 320);
        break;
      case "error":
        playTone(150, 0.2, "sawtooth", 0.15);
        break;
      case "join":
        playTone(440, 0.1, "sine", 0.2);
        setTimeout(() => playTone(660, 0.15, "sine", 0.2), 80);
        break;
    }
  } catch {
    // Audio not available
  }
}
