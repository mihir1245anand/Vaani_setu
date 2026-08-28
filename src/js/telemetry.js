/**
 * Vaani-Setu Client-side Performance & UX Telemetry Helper
 */
const Telemetry = {
    metrics: {
        pageLoadTime: null,
        languageSwitches: 0,
        voiceInteractions: 0,
        schemeSearches: 0
    },

    init() {
        window.addEventListener('load', () => {
            if (window.performance && window.performance.timing) {
                this.metrics.pageLoadTime = Date.now() - window.performance.timing.navigationStart;
            }
        });
    },

    trackEvent(category, action, label) {
        if (category === 'voice') this.metrics.voiceInteractions++;
        if (category === 'i18n') this.metrics.languageSwitches++;
        if (category === 'search') this.metrics.schemeSearches++;
    },

    getSummary() {
        return { ...this.metrics };
    }
};

if (typeof window !== 'undefined') {
    Telemetry.init();
}
