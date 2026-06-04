let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function resume(): AudioContext | null {
  const ctx = getCtx();
  if (!ctx) return null;
  void ctx.resume();
  return ctx;
}

/** 短いトーン（ADSR 付き） */
function playTone(
  frequency: number,
  startAt: number,
  durationSec: number,
  options?: { type?: OscillatorType; peakGain?: number },
): void {
  const ctx = getCtx();
  if (!ctx) return;

  const { type = "sine", peakGain = 0.14 } = options ?? {};
  const t0 = ctx.currentTime + startAt;
  const t1 = t0 + durationSec;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, t1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t1 + 0.02);
}

/** 正解: 明るい2音のチャイム */
export function beepCorrect(): void {
  if (!resume()) return;
  playTone(523.25, 0, 0.1, { peakGain: 0.12 });
  playTone(783.99, 0.09, 0.14, { peakGain: 0.13 });
}

/** 不正解: 柔らかい低めの2音 */
export function beepIncorrect(): void {
  if (!resume()) return;
  playTone(220, 0, 0.14, { type: "triangle", peakGain: 0.1 });
  playTone(185, 0.1, 0.16, { type: "triangle", peakGain: 0.08 });
}
