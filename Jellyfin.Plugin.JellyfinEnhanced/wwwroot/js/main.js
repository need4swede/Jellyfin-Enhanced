// Main entry point for Jellyfin Enhanced
import { CONSTANTS } from './core/constants.js';
import { Utils } from './core/utils.js';
import { StorageManager } from './core/storage.js';
import { eventManager } from './core/events.js';
import { shortcutManager } from './features/shortcuts.js';
import { playerManager } from './features/player.js';
import { bookmarkManager } from './features/bookmarks.js';
import { subtitleManager } from './features/subtitles.js';
import { randomManager } from './features/random.js';
import { toastManager } from './features/toast.js';
import { settingsPanel } from './ui/panel.js';

class JellyfinEnhanced {
    constructor() {
        this.version = CONSTANTS.SCRIPT_VERSION;
        this.isInitialized = false;
        this.managers = {};
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log(`Jellyfin Enhanced v${this.version} initializing...`);
        
        try {
            // Wait for Jellyfin to be ready
            await this.waitForJellyfin();
            
            // Initialize core systems
            this.initializeManagers();
            
            // Setup global shortcuts
            this.setupGlobalShortcuts();
            
            // Setup event handlers
            this.setupEventHandlers();
            
            // Initialize features
            await this.initializeFeatures();
            
            this.isInitialized = true;
            console.log('Jellyfin Enhanced initialized successfully');
            
            // Show initialization toast
            toastManager.success('Jellyfin Enhanced loaded successfully!');
            
        } catch (error) {
            console.error('Failed to initialize Jellyfin Enhanced:', error);
            toastManager.error('Failed to initialize Jellyfin Enhanced');
        }
    }

    async waitForJellyfin() {
        // Wait for basic Jellyfin elements to be present
        await Utils.waitForElement('.skinHeader, #apphost', 10000);
        
        // Wait a bit more for API to be ready
        return new Promise(resolve => {
            const checkApi = () => {
                if (window.ApiClient || window.require) {
                    resolve();
                } else {
                    setTimeout(checkApi, 100);
                }
            };
            checkApi();
        });
    }

    initializeManagers() {
        // Managers are already initialized as singletons
        this.managers = {
            storage: StorageManager,
            events: eventManager,
            shortcuts: shortcutManager,
            player: playerManager,
            bookmarks: bookmarkManager,
            subtitles: subtitleManager,
            random: randomManager,
            toast: toastManager,
            panel: settingsPanel
        };
    }

    setupGlobalShortcuts() {
        // Global shortcuts
        shortcutManager.register('?', () => settingsPanel.toggle(), 'global', 'Toggle settings panel');
        shortcutManager.register('/', () => this.focusSearch(), 'global', 'Focus search');
        shortcutManager.register('shift+h', () => this.goToHome(), 'global', 'Go to home');
        shortcutManager.register('d', () => this.goToDashboard(), 'global', 'Go to dashboard');
        shortcutManager.register('q', () => this.goToQuickConnect(), 'global', 'Quick connect');
        shortcutManager.register('r', () => randomManager.playRandomItem(), 'global', 'Play random item');
        
        // Player shortcuts
        shortcutManager.register('a', () => playerManager.cycleAspectRatio(), 'player', 'Cycle aspect ratio');
        shortcutManager.register('i', () => playerManager.showPlaybackInfo(), 'player', 'Show playback info');
        shortcutManager.register('s', () => this.showSubtitleMenu(), 'player', 'Show subtitle menu');
        shortcutManager.register('c', () => playerManager.cycleSubtitleTracks(), 'player', 'Cycle subtitle tracks');
        shortcutManager.register('v', () => playerManager.cycleAudioTracks(), 'player', 'Cycle audio tracks');
        shortcutManager.register('+', () => playerManager.increaseSpeed(), 'player', 'Increase playback speed');
        shortcutManager.register('=', () => playerManager.increaseSpeed(), 'player', 'Increase playback speed');
        shortcutManager.register('-', () => playerManager.decreaseSpeed(), 'player', 'Decrease playback speed');
        shortcutManager.register('r', () => playerManager.resetSpeed(), 'player', 'Reset playback speed');
        shortcutManager.register('b', () => this.bookmarkCurrentTime(), 'player', 'Bookmark current time');
        shortcutManager.register('shift+b', () => this.handleShiftB(), 'player', 'Go to bookmark or clear all');
        
        // Number keys for seeking
        for (let i = 0; i <= 9; i++) {
            shortcutManager.register(i.toString(), () => playerManager.seekToPercentage(i * 10), 'player', `Seek to ${i * 10}%`);
        }
    }

    setupEventHandlers() {
        // Subtitle events
        eventManager.on('subtitle:presetChanged', (preset) => {
            subtitleManager.setPreset(preset);
            toastManager.info(`Subtitle preset: ${preset}`);
        });
        
        eventManager.on('subtitle:sizeChanged', (size) => {
            subtitleManager.setFontSize(size);
            toastManager.info(`Subtitle size: ${size}`);
        });
        
        eventManager.on('subtitle:fontChanged', (font) => {
            subtitleManager.setFontFamily(font);
            toastManager.info(`Subtitle font: ${font}`);
        });
        
        // Bookmark events
        eventManager.on('bookmark:created', (data) => {
            toastManager.success(`Bookmarked at ${data.formattedTime}`);
        });
        
        eventManager.on('bookmark:restored', (data) => {
            toastManager.info(`Jumped to bookmark: ${data.formattedTime}`);
        });
        
        eventManager.on('bookmarks:clearAll', () => {
            const count = bookmarkManager.clearAllBookmarks();
            toastManager.success(`Cleared ${count} bookmarks`);
        });
        
        // Player events
        eventManager.on('player:speedChanged', (speed) => {
            toastManager.info(`Playback speed: ${speed}x`);
        });
        
        eventManager.on('player:aspectRatioChanged', (ratio) => {
            toastManager.info(`Aspect ratio: ${ratio}`);
        });
        
        eventManager.on('player:showInfo', (info) => {
            const message = `
                Time: ${info.currentTime} / ${info.duration}<br>
                Speed: ${info.playbackRate}x<br>
                Volume: ${info.volume}%<br>
                Buffered: ${info.buffered}%
            `;
            toastManager.info(message, 3000);
        });
        
        // Random events
        eventManager.on('random:loading', (isLoading) => {
            const button = document.querySelector('#jellyfin-enhanced-random-btn');
            if (button) {
                button.disabled = isLoading;
                button.innerHTML = isLoading ? '⏳' : '🎲';
            }
        });
        
        eventManager.on('random:noItems', () => {
            toastManager.warning('No items found for random selection');
        });
        
        eventManager.on('random:error', (error) => {
            toastManager.error('Failed to get random item');
        });
        
        eventManager.on('random:toggleButton', (enabled) => {
            randomManager.updateButtonVisibility();
        });
    }

    async initializeFeatures() {
        // Load user settings
        await this.loadUserSettings();
        
        // Initialize additional features
        this.setupContinueWatchingRemoval();
        this.setupFileSizeDisplay();
        this.setupAudioLanguageDisplay();
    }

    async loadUserSettings() {
        try {
            // Try to load server configuration
            const response = await fetch('/JellyfinEnhanced/config');
            if (response.ok) {
                const serverConfig = await response.json();
                this.applyServerConfig(serverConfig);
            }
        } catch (error) {
            console.warn('Could not load server configuration:', error);
        }
        
        // Apply local settings
        const localSettings = StorageManager.getSettings();
        this.applyLocalSettings(localSettings);
    }

    applyServerConfig(config) {
        // Apply server-side configuration
        const settings = StorageManager.getSettings();
        
        // Merge server defaults with local settings
        Object.keys(config).forEach(key => {
            if (settings[key] === undefined) {
                settings[key] = config[key];
            }
        });
        
        StorageManager.setSettings(settings);
    }

    applyLocalSettings(settings) {
        // Apply local settings to features
        if (settings.randomButtonEnabled) {
            randomManager.addRandomButton();
        }
    }

    // Shortcut handlers
    focusSearch() {
        const searchInput = document.querySelector(CONSTANTS.SELECTORS.SEARCH_INPUT);
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    goToHome() {
        window.location.href = '/web/index.html#!/home.html';
    }

    goToDashboard() {
        window.location.href = '/web/index.html#!/dashboard.html';
    }

    goToQuickConnect() {
        window.location.href = '/web/index.html#!/quickconnect.html';
    }

    showSubtitleMenu() {
        const subtitleButton = document.querySelector('.btnSubtitles, .subtitlesButton');
        if (subtitleButton) {
            subtitleButton.click();
        }
    }

    bookmarkCurrentTime() {
        if (bookmarkManager.bookmarkCurrentTime()) {
            // Success handled by event
        } else {
            toastManager.error('Could not create bookmark');
        }
    }

    handleShiftB() {
        const context = shortcutManager.getCurrentContext();
        if (context === 'player') {
            // In player, go to bookmark
            if (!bookmarkManager.goToBookmark()) {
                toastManager.warning('No bookmark found for this item');
            }
        } else {
            // Global context, start clear all bookmarks timer
            this.startClearBookmarksTimer();
        }
    }

    startClearBookmarksTimer() {
        const settings = StorageManager.getSettings();
        const delay = settings.clearBookmarksDelay || CONSTANTS.DEFAULTS.CLEAR_BOOKMARKS_DELAY;
        
        toastManager.warning(`Hold Shift+B for ${delay/1000} seconds to clear all bookmarks`, delay);
        
        // This would need more sophisticated handling for the hold detection
        // For now, just show the message
    }

    setupContinueWatchingRemoval() {
        // Add "Remove from Continue Watching" functionality
        const observer = new MutationObserver(() => {
            const continueWatchingItems = document.querySelectorAll('.continueWatchingItem, [data-type="ContinueWatching"] .card');
            continueWatchingItems.forEach(item => {
                if (!item.querySelector('.remove-continue-watching')) {
                    this.addRemoveContinueWatchingButton(item);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    addRemoveContinueWatchingButton(item) {
        const settings = StorageManager.getSettings();
        if (!settings.removeContinueWatchingEnabled) return;

        const button = Utils.createElement('button', {
            className: 'remove-continue-watching',
            innerHTML: '×',
            title: 'Remove from Continue Watching',
            style: `
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
                z-index: 1000;
            `
        });

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.removeContinueWatchingItem(item);
        });

        item.style.position = 'relative';
        item.appendChild(button);
    }

    async removeContinueWatchingItem(item) {
        try {
            // This would need to interact with Jellyfin's API to mark as watched
            // For now, just hide the item
            item.style.display = 'none';
            toastManager.success('Removed from Continue Watching');
        } catch (error) {
            toastManager.error('Failed to remove item');
        }
    }

    setupFileSizeDisplay() {
        const settings = StorageManager.getSettings();
        if (!settings.showFileSizes) return;

        // Implementation for showing file sizes
        // This would need to query the Jellyfin API for media info
    }

    setupAudioLanguageDisplay() {
        const settings = StorageManager.getSettings();
        if (!settings.showAudioLanguages) return;

        // Implementation for showing audio languages
        // This would need to query the Jellyfin API for media info
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (Utils.isJellyfinPage()) {
            new JellyfinEnhanced().init();
        }
    });
} else {
    if (Utils.isJellyfinPage()) {
        new JellyfinEnhanced().init();
    }
}