/**
 * Voice Error Boundary & Fallback Handler
 * Gracefully handles speech recognition permissions, network disconnects, and browser incompatibility.
 */
class VoiceErrorBoundary {
    static handleRecognitionError(errorEvent, notifyCallback) {
        console.warn('[Vaani-Setu Voice Engine] Recognition Event:', errorEvent.error);
        const errorMessages = {
            'no-speech': 'No speech detected. Please try speaking closer to the microphone.',
            'audio-capture': 'Microphone not detected. Please verify microphone hardware connection.',
            'not-allowed': 'Microphone access was blocked. Please enable permissions in your browser settings.',
            'network': 'Network connectivity issue during speech recognition. Falling back to text mode.',
            'aborted': 'Voice input session interrupted.'
        };
        const message = errorMessages[errorEvent.error] || 'Speech service unavailable. Please use text input.';
        if (typeof notifyCallback === 'function') {
            notifyCallback(message, errorEvent.error);
        }
        return message;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceErrorBoundary;
}
