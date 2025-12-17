const APP_PREFIX = import.meta.env.VITE_APP_NAME || 'pref-viz-';

/**
 * Utility functions for managing localStorage with a specific prefix.
 * This helps avoid conflicts with other applications using the same localStorage.
 */
export const setItem = (key: string, value: unknown) => {
    localStorage.setItem(`${APP_PREFIX}-${key}`, JSON.stringify(value));
};

export const getItem = (key: string): unknown => {
    const item = localStorage.getItem(`${APP_PREFIX}-${key}`);
    if (item) {
        try {
            return JSON.parse(item);
        } catch (error) {
            console.error(`Error parsing localStorage item for key "${key}":`, error);
            return null;
        }
    }
    return null;
};

export const removeItem = (key: string) => {
    localStorage.removeItem(`${APP_PREFIX}-${key}`);
};

export const clearStorage = () => {
    localStorage.clear();
};

export const isItemExists = (key: string): boolean => {
    return localStorage.getItem(`${APP_PREFIX}-${key}`) !== null;
};
