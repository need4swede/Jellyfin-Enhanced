// Storage management
import { CONSTANTS } from './constants.js';

export class StorageManager {
    static get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.warn(`Failed to get storage key ${key}:`, error);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Failed to set storage key ${key}:`, error);
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn(`Failed to remove storage key ${key}:`, error);
            return false;
        }
    }

    static clear() {
        try {
            // Only clear Jellyfin Enhanced keys
            Object.values(CONSTANTS.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.warn('Failed to clear storage:', error);
            return false;
        }
    }

    static getSettings() {
        return this.get(CONSTANTS.STORAGE_KEYS.SETTINGS, {});
    }

    static setSettings(settings) {
        return this.set(CONSTANTS.STORAGE_KEYS.SETTINGS, settings);
    }

    static getBookmarks() {
        return this.get(CONSTANTS.STORAGE_KEYS.BOOKMARKS, {});
    }

    static setBookmarks(bookmarks) {
        return this.set(CONSTANTS.STORAGE_KEYS.BOOKMARKS, bookmarks);
    }

    static getSubtitleSettings() {
        return this.get(CONSTANTS.STORAGE_KEYS.SUBTITLE_SETTINGS, {
            preset: 'clean-white',
            fontSize: 'normal',
            fontFamily: 'default'
        });
    }

    static setSubtitleSettings(settings) {
        return this.set(CONSTANTS.STORAGE_KEYS.SUBTITLE_SETTINGS, settings);
    }
}