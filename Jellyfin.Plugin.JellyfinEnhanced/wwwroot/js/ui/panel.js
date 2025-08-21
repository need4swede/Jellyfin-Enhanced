// Settings panel UI
import { Utils } from '../core/utils.js';
import { StorageManager } from '../core/storage.js';
import { eventManager } from '../core/events.js';
import { CONSTANTS } from '../core/constants.js';

export class SettingsPanel {
    constructor() {
        this.panel = null;
        this.isVisible = false;
        this.autoCloseTimer = null;
        this.init();
    }

    init() {
        this.createPanel();
        this.setupEventListeners();
    }

    createPanel() {
        this.panel = Utils.createElement('div', {
            id: 'jellyfin-enhanced-panel',
            style: `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(20, 20, 20, 0.95);
                border: 1px solid #444;
                border-radius: 8px;
                padding: 20px;
                z-index: 10000;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                color: #fff;
                font-family: inherit;
                display: none;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            `
        });

        this.renderContent();
        document.body.appendChild(this.panel);
    }

    renderContent() {
        const settings = StorageManager.getSettings();
        
        this.panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #444;">
                <h2 style="margin: 0; color: #00a4dc;">Jellyfin Enhanced</h2>
                <button id="close-panel" style="background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">×</button>
            </div>
            
            <div class="panel-content">
                ${this.renderShortcutsSection()}
                ${this.renderSubtitleSection()}
                ${this.renderPlaybackSection()}
                ${this.renderRandomSection()}
                ${this.renderBookmarksSection()}
            </div>
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #444; text-align: center; font-size: 12px; color: #888;">
                Press <kbd style="background: #333; padding: 2px 6px; border-radius: 3px;">?</kbd> to toggle this panel
            </div>
        `;
    }

    renderShortcutsSection() {
        return `
            <details open style="margin-bottom: 20px;">
                <summary style="cursor: pointer; font-weight: bold; color: #00a4dc; margin-bottom: 10px;">⌨️ Keyboard Shortcuts</summary>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px;">
                    <div>
                        <h4 style="margin: 0 0 8px 0; color: #ccc;">Global</h4>
                        <div><kbd>?</kbd> Show/hide this panel</div>
                        <div><kbd>/</kbd> Focus search</div>
                        <div><kbd>Shift+H</kbd> Go to home</div>
                        <div><kbd>D</kbd> Go to dashboard</div>
                        <div><kbd>Q</kbd> Quick connect</div>
                        <div><kbd>R</kbd> Play random item</div>
                        <div><kbd>Hold Shift+B</kbd> Clear bookmarks</div>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 8px 0; color: #ccc;">Player</h4>
                        <div><kbd>A</kbd> Cycle aspect ratio</div>
                        <div><kbd>I</kbd> Show playback info</div>
                        <div><kbd>S</kbd> Subtitle menu</div>
                        <div><kbd>C</kbd> Cycle subtitles</div>
                        <div><kbd>V</kbd> Cycle audio</div>
                        <div><kbd>+/-</kbd> Playback speed</div>
                        <div><kbd>R</kbd> Reset speed</div>
                        <div><kbd>B</kbd> Bookmark time</div>
                        <div><kbd>0-9</kbd> Jump to %</div>
                    </div>
                </div>
            </details>
        `;
    }

    renderSubtitleSection() {
        return `
            <details style="margin-bottom: 20px;">
                <summary style="cursor: pointer; font-weight: bold; color: #00a4dc; margin-bottom: 10px;">📝 Subtitle Settings</summary>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #ccc;">Style Preset</label>
                        <select id="subtitle-preset" style="width: 100%; padding: 5px; background: #333; color: #fff; border: 1px solid #555; border-radius: 4px;">
                            <option value="clean-white">Clean White</option>
                            <option value="classic-black">Classic Black</option>
                            <option value="netflix-style">Netflix Style</option>
                            <option value="cinema-yellow">Cinema Yellow</option>
                            <option value="soft-gray">Soft Gray</option>
                            <option value="high-contrast">High Contrast</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #ccc;">Font Size</label>
                        <select id="subtitle-size" style="width: 100%; padding: 5px; background: #333; color: #fff; border: 1px solid #555; border-radius: 4px;">
                            <option value="tiny">Tiny</option>
                            <option value="small">Small</option>
                            <option value="normal">Normal</option>
                            <option value="large">Large</option>
                            <option value="extra-large">Extra Large</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #ccc;">Font Family</label>
                        <select id="subtitle-font" style="width: 100%; padding: 5px; background: #333; color: #fff; border: 1px solid #555; border-radius: 4px;">
                            <option value="default">Default</option>
                            <option value="noto-sans">Noto Sans</option>
                            <option value="sans-serif">Sans Serif</option>
                            <option value="typewriter">Typewriter</option>
                            <option value="roboto">Roboto</option>
                        </select>
                    </div>
                </div>
            </details>
        `;
    }

    renderPlaybackSection() {
        const settings = StorageManager.getSettings();
        
        return `
            <details style="margin-bottom: 20px;">
                <summary style="cursor: pointer; font-weight: bold; color: #00a4dc; margin-bottom: 10px;">⏯️ Playback Settings</summary>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="auto-pause" ${settings.autoPauseEnabled ? 'checked' : ''} style="margin: 0;">
                        <span style="font-size: 13px;">Auto-pause on tab switch</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="auto-resume" ${settings.autoResumeEnabled ? 'checked' : ''} style="margin: 0;">
                        <span style="font-size: 13px;">Auto-resume on tab return</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="auto-skip-intro" ${settings.autoSkipIntro ? 'checked' : ''} style="margin: 0;">
                        <span style="font-size: 13px;">Auto-skip intro</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="auto-skip-outro" ${settings.autoSkipOutro ? 'checked' : ''} style="margin: 0;">
                        <span style="font-size: 13px;">Auto-skip outro</span>
                    </label>
                </div>
            </details>
        `;
    }

    renderRandomSection() {
        const settings = StorageManager.getSettings();
        
        return `
            <details style="margin-bottom: 20px;">
                <summary style="cursor: pointer; font-weight: bold; color: #00a4dc; margin-bottom: 10px;">🎲 Random Selection</summary>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="random-enabled" ${settings.randomButtonEnabled ? 'checked' : ''} style="margin: 0;">
                        <span style="font-size: 13px;">Enable random button</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="random-unwatched" ${settings.randomUnwatchedOnly ? 'checked' : ''} style="margin: 0;">
                        <span style="font-size: 13px;">Unwatched only</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="random-movies" ${settings.randomIncludeMovies ? 'checked' : ''} style="margin: 0;">
                        <span style="font-size: 13px;">Include movies</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="random-shows" ${settings.randomIncludeShows ? 'checked' : ''} style="margin: 0;">
                        <span style="font-size: 13px;">Include shows</span>
                    </label>
                </div>
            </details>
        `;
    }

    renderBookmarksSection() {
        return `
            <details style="margin-bottom: 20px;">
                <summary style="cursor: pointer; font-weight: bold; color: #00a4dc; margin-bottom: 10px;">🔖 Bookmarks</summary>
                <div style="text-align: center;">
                    <button id="clear-bookmarks" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;">
                        Clear All Bookmarks
                    </button>
                    <div style="margin-top: 8px; font-size: 12px; color: #888;">
                        Or hold <kbd style="background: #333; padding: 2px 6px; border-radius: 3px;">Shift+B</kbd> for 3 seconds
                    </div>
                </div>
            </details>
        `;
    }

    setupEventListeners() {
        // Close button
        this.panel.addEventListener('click', (e) => {
            if (e.target.id === 'close-panel') {
                this.hide();
            }
        });

        // Settings change handlers
        this.panel.addEventListener('change', (e) => {
            this.handleSettingChange(e);
        });

        // Clear bookmarks button
        this.panel.addEventListener('click', (e) => {
            if (e.target.id === 'clear-bookmarks') {
                eventManager.emit('bookmarks:clearAll');
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.isVisible && !this.panel.contains(e.target)) {
                this.hide();
            }
        });

        // Auto-close timer
        eventManager.on('panel:show', () => {
            this.startAutoCloseTimer();
        });
    }

    handleSettingChange(e) {
        const settings = StorageManager.getSettings();
        
        switch (e.target.id) {
            case 'subtitle-preset':
                eventManager.emit('subtitle:presetChanged', e.target.value);
                break;
            case 'subtitle-size':
                eventManager.emit('subtitle:sizeChanged', e.target.value);
                break;
            case 'subtitle-font':
                eventManager.emit('subtitle:fontChanged', e.target.value);
                break;
            case 'auto-pause':
                settings.autoPauseEnabled = e.target.checked;
                StorageManager.setSettings(settings);
                break;
            case 'auto-resume':
                settings.autoResumeEnabled = e.target.checked;
                StorageManager.setSettings(settings);
                break;
            case 'auto-skip-intro':
                settings.autoSkipIntro = e.target.checked;
                StorageManager.setSettings(settings);
                break;
            case 'auto-skip-outro':
                settings.autoSkipOutro = e.target.checked;
                StorageManager.setSettings(settings);
                break;
            case 'random-enabled':
                settings.randomButtonEnabled = e.target.checked;
                StorageManager.setSettings(settings);
                eventManager.emit('random:toggleButton', e.target.checked);
                break;
            case 'random-unwatched':
                settings.randomUnwatchedOnly = e.target.checked;
                StorageManager.setSettings(settings);
                break;
            case 'random-movies':
                settings.randomIncludeMovies = e.target.checked;
                StorageManager.setSettings(settings);
                break;
            case 'random-shows':
                settings.randomIncludeShows = e.target.checked;
                StorageManager.setSettings(settings);
                break;
        }
    }

    show() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        this.panel.style.display = 'block';
        this.updateContent();
        eventManager.emit('panel:show');
    }

    hide() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.panel.style.display = 'none';
        this.clearAutoCloseTimer();
        eventManager.emit('panel:hide');
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    updateContent() {
        // Update form values with current settings
        const settings = StorageManager.getSettings();
        const subtitleSettings = StorageManager.getSubtitleSettings();
        
        const elements = {
            'subtitle-preset': subtitleSettings.preset,
            'subtitle-size': subtitleSettings.fontSize,
            'subtitle-font': subtitleSettings.fontFamily,
            'auto-pause': settings.autoPauseEnabled,
            'auto-resume': settings.autoResumeEnabled,
            'auto-skip-intro': settings.autoSkipIntro,
            'auto-skip-outro': settings.autoSkipOutro,
            'random-enabled': settings.randomButtonEnabled,
            'random-unwatched': settings.randomUnwatchedOnly,
            'random-movies': settings.randomIncludeMovies,
            'random-shows': settings.randomIncludeShows
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = this.panel.querySelector(`#${id}`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }

    startAutoCloseTimer() {
        this.clearAutoCloseTimer();
        const settings = StorageManager.getSettings();
        const delay = settings.helpPanelAutocloseDelay || CONSTANTS.DEFAULTS.HELP_PANEL_AUTOCLOSE_DELAY;
        
        this.autoCloseTimer = setTimeout(() => {
            this.hide();
        }, delay);
    }

    clearAutoCloseTimer() {
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }
    }
}

// Global settings panel instance
export const settingsPanel = new SettingsPanel();