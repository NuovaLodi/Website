export function onReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

export function formatItalianDate(date, options = {}) {
    if (!date || isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleDateString('it-IT', options);
}

export function formatItalianTime(date) {
    if (!date || isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

