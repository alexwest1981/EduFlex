/**
 * Formats a date string or timestamp into a localized readable string.
 * @param {string|Date|number|Array} date - The date to format.
 * @param {object} options - Intl.DateTimeFormat options.
 * @returns {string} - The formatted date string.
 */
export const formatDate = (date, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
    if (!date) return '';
    try {
        let dateObj;
        // Handle Java-style array dates [yyyy, mm, dd, hh, mm]
        if (Array.isArray(date)) {
            dateObj = new Date(date[0], date[1] - 1, date[2], date[3] || 0, date[4] || 0);
        } else {
            dateObj = new Date(date);
        }

        if (isNaN(dateObj.getTime())) return '';

        return new Intl.DateTimeFormat('sv-SE', options).format(dateObj);
    } catch (e) {
        console.error("Error formatting date:", e);
        return String(date);
    }
};

/**
 * Formats a date into a time string (HH:MM).
 * @param {string|Date|number|Array} date 
 * @returns {string}
 */
export const formatTime = (date) => {
    return formatDate(date, { hour: '2-digit', minute: '2-digit' });
};
