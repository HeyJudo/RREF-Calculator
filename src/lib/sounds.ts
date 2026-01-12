// Cyberpunk Sound Effects using Web Audio API
// No external files needed - generates sounds programmatically

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    return audioContext;
}

// Mechanical keyboard click sound
export function playKeyClick(): void {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.02);
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.02);
    } catch (e) {
        // Audio not supported or blocked
    }
}

// Charge up sound for Execute button
export function playChargeUp(): void {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(100, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
        // Audio not supported
    }
}

// Success chime sound
export function playSuccess(): void {
    try {
        const ctx = getAudioContext();

        // Play a nice chord progression
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord

        frequencies.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
            oscillator.type = 'sine';

            const startTime = ctx.currentTime + index * 0.08;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.5);
        });
    } catch (e) {
        // Audio not supported
    }
}

// Error buzz sound
export function playError(): void {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.type = 'sawtooth';

        // Create a buzzing effect
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
        // Audio not supported
    }
}

// Neo welcome sound (Matrix-style swoosh)
export function playNeoWelcome(): void {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);
        oscillator.type = 'triangle';

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
        // Audio not supported
    }
}

// Neo celebrate sound (Victory fanfare)
export function playNeoCelebrate(): void {
    try {
        const ctx = getAudioContext();

        // Ascending victory tones
        const notes = [
            { freq: 392, time: 0 },      // G4
            { freq: 523.25, time: 0.1 }, // C5
            { freq: 659.25, time: 0.2 }, // E5
            { freq: 783.99, time: 0.3 }, // G5
        ];

        notes.forEach(({ freq, time }) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.setValueAtTime(freq, ctx.currentTime + time);
            oscillator.type = 'triangle';

            gainNode.gain.setValueAtTime(0, ctx.currentTime + time);
            gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + time + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.3);

            oscillator.start(ctx.currentTime + time);
            oscillator.stop(ctx.currentTime + time + 0.3);
        });
    } catch (e) {
        // Audio not supported
    }
}
