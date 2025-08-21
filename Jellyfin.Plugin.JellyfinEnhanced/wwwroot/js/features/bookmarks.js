// Bookmark management
import { StorageManager } from '../core/storage.js';
import { Utils } from '../core/utils.js';
import { eventManager } from '../core/events.js';

export class BookmarkManager {
    constructor() {
        this.bookmarks = StorageManager.getBookmarks();
        this.init();
    }

    init() {
        eventManager.on('player:ready', this.onPlayerReady.bind(this));
    }

    onPlayerReady() {
        // Auto-restore bookmark if exists
        const itemId = this.getCurrentItemId();
        if (itemId && this.bookmarks[itemId]) {
            this.showBookmarkRestorePrompt(itemId);
        }
    }

    getCurrentItemId() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('id') || null;
        } catch (error) {
            console.warn('Could not get current item ID:', error);
            return null;
        }
    }

    bookmarkCurrentTime() {
        const video = document.querySelector('video');
        if (!video) return false;

        const itemId = this.getCurrentItemId();
        if (!itemId) return false;

        const currentTime = video.currentTime;
        const duration = video.duration;
        
        if (!currentTime || !duration) return false;

        this.bookmarks[itemId] = {
            time: currentTime,
            duration: duration,
            timestamp: Date.now(),
            title: this.getCurrentItemTitle()
        };

        StorageManager.setBookmarks(this.bookmarks);
        
        eventManager.emit('bookmark:created', {
            itemId,
            time: currentTime,
            formattedTime: Utils.formatTime(currentTime)
        });

        return true;
    }

    goToBookmark() {
        const video = document.querySelector('video');
        if (!video) return false;

        const itemId = this.getCurrentItemId();
        if (!itemId || !this.bookmarks[itemId]) return false;

        const bookmark = this.bookmarks[itemId];
        video.currentTime = bookmark.time;

        eventManager.emit('bookmark:restored', {
            itemId,
            time: bookmark.time,
            formattedTime: Utils.formatTime(bookmark.time)
        });

        return true;
    }

    removeBookmark(itemId) {
        if (this.bookmarks[itemId]) {
            delete this.bookmarks[itemId];
            StorageManager.setBookmarks(this.bookmarks);
            eventManager.emit('bookmark:removed', { itemId });
            return true;
        }
        return false;
    }

    clearAllBookmarks() {
        const count = Object.keys(this.bookmarks).length;
        this.bookmarks = {};
        StorageManager.setBookmarks(this.bookmarks);
        
        eventManager.emit('bookmark:allCleared', { count });
        return count;
    }

    getAllBookmarks() {
        return { ...this.bookmarks };
    }

    getBookmarkCount() {
        return Object.keys(this.bookmarks).length;
    }

    getCurrentItemTitle() {
        try {
            const titleElement = document.querySelector('.videoOsdTitle, .nowPlayingBarText, h1');
            return titleElement ? titleElement.textContent.trim() : 'Unknown';
        } catch (error) {
            return 'Unknown';
        }
    }

    showBookmarkRestorePrompt(itemId) {
        const bookmark = this.bookmarks[itemId];
        if (!bookmark) return;

        const formattedTime = Utils.formatTime(bookmark.time);
        
        eventManager.emit('bookmark:restorePrompt', {
            itemId,
            time: bookmark.time,
            formattedTime,
            title: bookmark.title
        });
    }

    // Cleanup old bookmarks (older than 30 days)
    cleanupOldBookmarks() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        let cleaned = 0;

        Object.keys(this.bookmarks).forEach(itemId => {
            const bookmark = this.bookmarks[itemId];
            if (bookmark.timestamp < thirtyDaysAgo) {
                delete this.bookmarks[itemId];
                cleaned++;
            }
        });

        if (cleaned > 0) {
            StorageManager.setBookmarks(this.bookmarks);
            eventManager.emit('bookmark:cleaned', { count: cleaned });
        }

        return cleaned;
    }
}

// Global bookmark manager instance
export const bookmarkManager = new BookmarkManager();