/**
 * Regional Currency & Number Localization Formatters
 */
const Formatters = {
    formatINR(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    },

    formatIndianNumber(num) {
        return new Intl.NumberFormat('en-IN').format(num);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Formatters;
}
