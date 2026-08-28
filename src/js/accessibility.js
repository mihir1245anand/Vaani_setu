/**
 * Accessibility (A11y) Live Region & Screen Reader Announcer
 */
const A11yAnnouncer = {
    liveRegion: null,

    init() {
        if (!this.liveRegion && typeof document !== 'undefined') {
            this.liveRegion = document.createElement('div');
            this.liveRegion.setAttribute('aria-live', 'polite');
            this.liveRegion.setAttribute('aria-atomic', 'true');
            this.liveRegion.className = 'sr-only';
            this.liveRegion.style.position = 'absolute';
            this.liveRegion.style.width = '1px';
            this.liveRegion.style.height = '1px';
            this.liveRegion.style.overflow = 'hidden';
            document.body.appendChild(this.liveRegion);
        }
    },

    speak(text) {
        this.init();
        if (this.liveRegion) {
            this.liveRegion.textContent = '';
            setTimeout(() => {
                this.liveRegion.textContent = text;
            }, 50);
        }
    }
};
