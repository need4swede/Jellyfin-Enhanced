// Subtitle customization
import { StorageManager } from '../core/storage.js';
import { SUBTITLE_PRESETS, FONT_SIZES, FONT_FAMILIES } from '../core/constants.js';
import { eventManager } from '../core/events.js';

export class SubtitleManager {
    constructor() {
        this.settings = StorageManager.getSubtitleSettings();
        this.styleElement = null;
        this.init();
    }

    init() {
        this.createStyleElement();
        this.applySettings();
        eventManager.on('player:ready', this.onPlayerReady.bind(this));
    }

    createStyleElement() {
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'jellyfin-enhanced-subtitles';
        document.head.appendChild(this.styleElement);
    }

    onPlayerReady() {
        // Reapply subtitle settings when player is ready
        this.applySettings();
    }

    applySettings() {
        if (!this.styleElement) return;

        const preset = SUBTITLE_PRESETS[this.settings.preset] || SUBTITLE_PRESETS['clean-white'];
        const fontSize = FONT_SIZES[this.settings.fontSize] || FONT_SIZES['normal'];
        const fontFamily = FONT_FAMILIES[this.settings.fontFamily] || FONT_FAMILIES['default'];

        const css = `
            .videoSubtitles, .subtitleTrack, .htmlVideoPlayerContainer .subtitleTrack {
                color: ${preset.color} !important;
                background-color: ${preset.backgroundColor} !important;
                text-shadow: ${preset.textShadow} !important;
                font-weight: ${preset.fontWeight} !important;
                font-size: ${fontSize.value} !important;
                font-family: ${fontFamily.value} !important;
                line-height: 1.2 !important;
                padding: ${preset.backgroundColor !== 'transparent' ? '0.2em 0.4em' : '0'} !important;
                border-radius: ${preset.backgroundColor !== 'transparent' ? '0.2em' : '0'} !important;
            }
            
            .videoSubtitles .subtitleTrack {
                margin-bottom: 0.5em !important;
            }
        `;

        this.styleElement.textContent = css;
        eventManager.emit('subtitle:settingsApplied', this.settings);
    }

    setPreset(presetKey) {
        if (!SUBTITLE_PRESETS[presetKey]) return false;

        this.settings.preset = presetKey;
        this.saveSettings();
        this.applySettings();
        return true;
    }

    setFontSize(sizeKey) {
        if (!FONT_SIZES[sizeKey]) return false;

        this.settings.fontSize = sizeKey;
        this.saveSettings();
        this.applySettings();
        return true;
    }

    setFontFamily(familyKey) {
        if (!FONT_FAMILIES[familyKey]) return false;

        this.settings.fontFamily = familyKey;
        this.saveSettings();
        this.applySettings();
        return true;
    }

    saveSettings() {
        StorageManager.setSubtitleSettings(this.settings);
    }

    getSettings() {
        return { ...this.settings };
    }

    getAvailablePresets() {
        return Object.entries(SUBTITLE_PRESETS).map(([key, preset]) => ({
            key,
            name: preset.name
        }));
    }

    getAvailableFontSizes() {
        return Object.entries(FONT_SIZES).map(([key, size]) => ({
            key,
            name: size.name
        }));
    }

    getAvailableFontFamilies() {
        return Object.entries(FONT_FAMILIES).map(([key, family]) => ({
            key,
            name: family.name
        }));
    }

    reset() {
        this.settings = {
            preset: 'clean-white',
            fontSize: 'normal',
            fontFamily: 'default'
        };
        this.saveSettings();
        this.applySettings();
        eventManager.emit('subtitle:reset');
    }
}

// Global subtitle manager instance
export const subtitleManager = new SubtitleManager();