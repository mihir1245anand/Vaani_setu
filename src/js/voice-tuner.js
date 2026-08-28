/**
 * Voice Tuning & Synthesis Profile Customizer
 */
const VoiceTuner = {
    settings: {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
    },

    setRate(rate) {
        this.settings.rate = Math.max(0.5, Math.min(2.0, rate));
    },

    setPitch(pitch) {
        this.settings.pitch = Math.max(0.5, Math.min(1.5, pitch));
    },

    applyToUtterance(utterance) {
        utterance.rate = this.settings.rate;
        utterance.pitch = this.settings.pitch;
        utterance.volume = this.settings.volume;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceTuner;
}
