let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function tone(frequency: number, durationMs: number): void {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  gain.gain.value = 0.08;
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000);
}

export function beepCorrect(): void {
  void getCtx()?.resume();
  tone(880, 80);
}

export function beepIncorrect(): void {
  void getCtx()?.resume();
  tone(220, 120);
}
