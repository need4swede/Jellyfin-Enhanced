// Core constants and configuration
export const CONSTANTS = {
    SCRIPT_VERSION: '5.3.0',
    PLUGIN_NAME: 'Jellyfin Enhanced',
    STORAGE_KEYS: {
        SETTINGS: 'jellyfinEnhanced_settings',
        BOOKMARKS: 'jellyfinEnhanced_bookmarks',
        SUBTITLE_SETTINGS: 'jellyfinEnhanced_subtitleSettings'
    },
    SELECTORS: {
        VIDEO_PLAYER: 'video',
        SEARCH_INPUT: '.searchFields input[type="text"]',
        SUBTITLE_TRACK: '.subtitleTrackMenuItem',
        AUDIO_TRACK: '.audioTrackMenuItem',
        SKIP_INTRO_BUTTON: '.btnSkipIntro',
        SKIP_OUTRO_BUTTON: '.btnSkipOutro'
    },
    DEFAULTS: {
        TOAST_DURATION: 1500,
        HELP_PANEL_AUTOCLOSE_DELAY: 15000,
        CLEAR_BOOKMARKS_DELAY: 3000,
        PLAYBACK_SPEEDS: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0],
        ASPECT_RATIOS: ['auto', 'cover', 'fill']
    }
};

export const SUBTITLE_PRESETS = {
    'clean-white': {
        name: 'Clean White',
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        fontWeight: 'normal'
    },
    'classic-black': {
        name: 'Classic Black Box',
        color: '#FFFFFF',
        backgroundColor: 'rgba(0,0,0,0.8)',
        textShadow: 'none',
        fontWeight: 'normal'
    },
    'netflix-style': {
        name: 'Netflix Style',
        color: '#FFFFFF',
        backgroundColor: 'rgba(0,0,0,0.6)',
        textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
        fontWeight: 'bold'
    },
    'cinema-yellow': {
        name: 'Cinema Yellow',
        color: '#FFD700',
        backgroundColor: 'transparent',
        textShadow: '2px 2px 4px rgba(0,0,0,1)',
        fontWeight: 'bold'
    },
    'soft-gray': {
        name: 'Soft Gray',
        color: '#E0E0E0',
        backgroundColor: 'rgba(0,0,0,0.4)',
        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
        fontWeight: 'normal'
    },
    'high-contrast': {
        name: 'High Contrast',
        color: '#000000',
        backgroundColor: '#FFFFFF',
        textShadow: 'none',
        fontWeight: 'bold'
    }
};

export const FONT_SIZES = {
    'tiny': { name: 'Tiny', value: '0.8em' },
    'small': { name: 'Small', value: '1.0em' },
    'normal': { name: 'Normal', value: '1.2em' },
    'large': { name: 'Large', value: '1.5em' },
    'extra-large': { name: 'Extra Large', value: '1.8em' }
};

export const FONT_FAMILIES = {
    'default': { name: 'Default', value: 'inherit' },
    'noto-sans': { name: 'Noto Sans', value: '"Noto Sans", sans-serif' },
    'sans-serif': { name: 'Sans Serif', value: 'sans-serif' },
    'typewriter': { name: 'Typewriter', value: '"Courier New", monospace' },
    'roboto': { name: 'Roboto', value: '"Roboto", sans-serif' }
};