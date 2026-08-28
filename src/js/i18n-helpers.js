/**
 * i18n Translation & String Cache Utilities
 */
const I18nHelper = {
    cache: new Map(),

    formatString(template, vars = {}) {
        return template.replace(/{(\w+)}/g, (match, key) => {
            return typeof vars[key] !== 'undefined' ? vars[key] : match;
        });
    },

    getDirection(langCode) {
        const rtlLangs = ['ur', 'ar'];
        return rtlLangs.includes(langCode) ? 'rtl' : 'ltr';
    },

    sanitizeLocale(locale) {
        return (locale || 'en').toLowerCase().split('-')[0];
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nHelper;
}
