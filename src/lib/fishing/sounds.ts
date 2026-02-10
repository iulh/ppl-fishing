class SoundManager {
    private ctx: AudioContext | null = null;
    private ready = false;

    init(): void {
        if (this.ready) return;
        try {
            this.ctx = new AudioContext();
            this.ready = true;
        } catch {
            /* Web Audio unavailable */
        }
    }

    private ac(): AudioContext | null {
        if (!this.ctx) this.init();
        if (this.ctx?.state === 'suspended') this.ctx.resume();
        return this.ctx;
    }

    playSplash(): void {
        const c = this.ac();
        if (!c) return;
        const len = c.sampleRate * 0.3;
        const buf = c.createBuffer(1, len, c.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
            const t = i / len;
            d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8) * 0.3;
        }
        const src = c.createBufferSource();
        src.buffer = buf;
        const lp = c.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 800;
        const g = c.createGain();
        g.gain.value = 0.3;
        src.connect(lp).connect(g).connect(c.destination);
        src.start();
    }

    playBite(): void {
        const c = this.ac();
        if (!c) return;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(800, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(400, c.currentTime + 0.15);
        g.gain.setValueAtTime(0.2, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
        o.connect(g).connect(c.destination);
        o.start();
        o.stop(c.currentTime + 0.2);
    }

    playReelClick(): void {
        const c = this.ac();
        if (!c) return;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'square';
        o.frequency.value = 1200;
        g.gain.setValueAtTime(0.04, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.03);
        o.connect(g).connect(c.destination);
        o.start();
        o.stop(c.currentTime + 0.03);
    }

    playCatch(rarity: string): void {
        const c = this.ac();
        if (!c) return;
        const notes =
            rarity === 'legendary'
                ? [523, 659, 784, 1047]
                : rarity === 'epic'
                  ? [440, 554, 659]
                  : rarity === 'rare'
                    ? [440, 523, 659]
                    : [440, 523];
        notes.forEach((freq, i) => {
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = 'sine';
            o.frequency.value = freq;
            const t0 = c.currentTime + i * 0.15;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(0.15, t0 + 0.05);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
            o.connect(g).connect(c.destination);
            o.start(t0);
            o.stop(t0 + 0.3);
        });
    }

    playEscape(): void {
        const c = this.ac();
        if (!c) return;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(400, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(100, c.currentTime + 0.4);
        g.gain.setValueAtTime(0.1, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
        o.connect(g).connect(c.destination);
        o.start();
        o.stop(c.currentTime + 0.4);
    }

    playLineTension(): void {
        const c = this.ac();
        if (!c) return;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'triangle';
        o.frequency.value = 200 + Math.random() * 100;
        g.gain.setValueAtTime(0.05, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
        o.connect(g).connect(c.destination);
        o.start();
        o.stop(c.currentTime + 0.1);
    }
}

export const soundManager = new SoundManager();
