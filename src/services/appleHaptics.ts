// Apple iOS Taptic & Micro-Haptic Audio Simulation
// Produces authentic Cupertino-style tactile feedback on iPhone devices

class AppleHapticService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Soft selection change haptic (like switching iOS tabs or segment)
  public selection(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(8); } catch (_) {}
    }
    this.playTone(180, 0.015, 'sine', 0.12);
  }

  // Light impact haptic (like tapping an iOS button)
  public light(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(12); } catch (_) {}
    }
    this.playTone(140, 0.02, 'sine', 0.18);
  }

  public click(): void {
    this.light();
  }

  // Medium impact (like opening an action sheet or modal)
  public medium(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(20); } catch (_) {}
    }
    this.playTone(110, 0.035, 'triangle', 0.22);
  }

  // Success notification haptic (like authorizing J.A.R.V.I.S. or submitting report)
  public success(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([15, 60, 20]); } catch (_) {}
    }
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(659.25, now + 0.06); // E5
      gain2.gain.setValueAtTime(0.16, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.18);
    } catch (_) {}
  }

  // Warning / Alert haptic (like invalid passcode or critical breach)
  public error(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([30, 40, 30]); } catch (_) {}
    }
    this.playTone(85, 0.08, 'sawtooth', 0.25);
  }

  public warning(): void {
    this.error();
  }

  private playTone(freq: number, duration: number, type: OscillatorType, volume: number): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (_) {}
  }

  // Detect if user is on Apple iPhone, iPad, or iPod
  public isAppleDevice(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
}

export const AppleHaptics = new AppleHapticService();
