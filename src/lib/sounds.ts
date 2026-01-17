/**
 * @fileoverview Cyberpunk Sound Effects Module using Web Audio API
 * 
 * This module generates all sound effects programmatically using the Web Audio API.
 * No external audio files are required - sounds are synthesized in real-time.
 * 
 * ## Audio Architecture
 * Each sound effect uses a chain of Web Audio nodes:
 * - **Oscillator**: Generates the base waveform (sine, square, sawtooth, triangle)
 * - **GainNode**: Controls volume and creates envelope (attack/decay/release)
 * - **BiquadFilter**: (Optional) Shapes the frequency spectrum
 * 
 * ## Sound Design Philosophy
 * All sounds follow a "cyberpunk" aesthetic with:
 * - Frequency sweeps for futuristic feel
 * - Short, punchy envelopes
 * - Synthesizer-style waveforms
 * 
 * @author RREF Calculator Team
 * @version 1.0.0
 */

/**
 * Singleton AudioContext instance.
 * Web Audio API requires a single AudioContext per application.
 * Lazily initialized on first sound playback.
 */
let audioContext: AudioContext | null = null;

/**
 * Gets or creates the singleton AudioContext.
 * AudioContext is created lazily to comply with browser autoplay policies.
 * 
 * @returns {AudioContext} The shared AudioContext instance
 * @private
 */
function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    return audioContext;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERACTION SOUNDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Plays a mechanical keyboard click sound.
 * 
 * Used when: User types in matrix cells
 * 
 * Sound Design:
 * - Square wave for sharp attack (800Hz → 200Hz)
 * - Very short duration (20ms) for percussive feel
 * - Low volume to avoid fatigue
 * 
 * @returns {void}
 */
export function playKeyClick(): void {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Connect audio graph: Oscillator → Gain → Output
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Frequency sweep: 800Hz down to 200Hz for "click" feel
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.02);
        oscillator.type = 'square';  // Sharp, digital sound

        // Volume envelope: Quick attack and decay
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.02);
    } catch (e) {
        // Audio not supported or blocked by browser autoplay policy
    }
}

/**
 * Plays a "charging up" sound effect.
 * 
 * Used when: User clicks "Execute RREF" button
 * 
 * Sound Design:
 * - Sawtooth wave for rich harmonics
 * - Ascending frequency sweep (100Hz → 800Hz) suggesting "powering up"
 * - 300ms duration for dramatic effect
 * 
 * @returns {void}
 */
export function playChargeUp(): void {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Ascending frequency sweep: Low to high = "charging"
        oscillator.frequency.setValueAtTime(100, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
        oscillator.type = 'sawtooth';  // Rich, buzzy harmonics

        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
        // Audio not supported
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEEDBACK SOUNDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Plays a pleasant success chime (C major chord).
 * 
 * Used when: RREF calculation completes with infinite or no solution
 * 
 * Sound Design:
 * - Plays C5-E5-G5 chord (C major) sequentially
 * - Sine waves for pure, pleasant tone
 * - Staggered timing (80ms apart) for arpeggio effect
 * 
 * @returns {void}
 */
export function playSuccess(): void {
    try {
        const ctx = getAudioContext();

        // C major chord: C5, E5, G5 (frequencies in Hz)
        const frequencies = [523.25, 659.25, 783.99];

        frequencies.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
            oscillator.type = 'sine';  // Pure, clean tone

            // Stagger each note by 80ms for arpeggio effect
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

/**
 * Plays an error buzz sound.
 * 
 * Used when: Invalid matrix or calculation error
 * 
 * Sound Design:
 * - Low frequency (150Hz) for ominous feel
 * - Sawtooth wave for harsh, buzzy texture
 * - Pulsing gain for "alarm" effect
 * 
 * @returns {void}
 */
export function playError(): void {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.type = 'sawtooth';  // Harsh, warning-like

        // Pulsing gain envelope: loud-quiet-loud-fade
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

// ═══════════════════════════════════════════════════════════════════════════════
// NEO MASCOT SOUNDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Plays a Matrix-style "swoosh" sound for Neo's welcome.
 * 
 * Used when: Welcome modal appears with Neo waving
 * 
 * Sound Design:
 * - Triangle wave for smooth, digital feel
 * - Frequency sweep up then down (200 → 600 → 400 Hz)
 * - Lowpass filter to soften high frequencies
 * 
 * @returns {void}
 */
export function playNeoWelcome(): void {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Audio graph with filter: Oscillator → Filter → Gain → Output
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Frequency sweep: Rise then fall for "swoosh" effect
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);
        oscillator.type = 'triangle';  // Smooth, Matrix-like

        // Lowpass filter to remove harsh highs
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);

        // Fade in, then fade out
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
        // Audio not supported
    }
}

/**
 * Plays a victory fanfare for Neo's celebration.
 * 
 * Used when: Unique solution is found (Neo celebrates)
 * 
 * Sound Design:
 * - Ascending G major arpeggio (G4 → C5 → E5 → G5)
 * - Triangle waves for warm, celebratory tone
 * - Each note 100ms apart for clear melody
 * 
 * @returns {void}
 */
export function playNeoCelebrate(): void {
    try {
        const ctx = getAudioContext();

        // Ascending G major arpeggio: G4, C5, E5, G5
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

            // Quick attack, medium decay
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
