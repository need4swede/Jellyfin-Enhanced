// Keyboard shortcuts management
import { eventManager } from '../core/events.js';
import { CONSTANTS } from '../core/constants.js';

export class ShortcutManager {
    constructor() {
        this.shortcuts = new Map();
        this.isEnabled = true;
        this.activeModifiers = new Set();
        this.init();
    }

    init() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        document.addEventListener('blur', this.clearModifiers.bind(this));
    }

    register(key, callback, context = 'global', description = '') {
        const shortcutKey = `${context}:${key.toLowerCase()}`;
        this.shortcuts.set(shortcutKey, {
            key,
            callback,
            context,
            description
        });
    }

    unregister(key, context = 'global') {
        const shortcutKey = `${context}:${key.toLowerCase()}`;
        this.shortcuts.delete(shortcutKey);
    }

    handleKeyDown(event) {
        if (!this.isEnabled) return;
        
        // Track modifier keys
        if (event.key === 'Shift') this.activeModifiers.add('shift');
        if (event.key === 'Control') this.activeModifiers.add('ctrl');
        if (event.key === 'Alt') this.activeModifiers.add('alt');
        if (event.key === 'Meta') this.activeModifiers.add('meta');

        // Skip if typing in input fields
        if (this.isTypingInInput(event.target)) return;

        const keyCombo = this.buildKeyCombo(event);
        const context = this.getCurrentContext();
        
        // Try context-specific shortcut first, then global
        const contextKey = `${context}:${keyCombo}`;
        const globalKey = `global:${keyCombo}`;
        
        const shortcut = this.shortcuts.get(contextKey) || this.shortcuts.get(globalKey);
        
        if (shortcut) {
            event.preventDefault();
            event.stopPropagation();
            
            try {
                shortcut.callback(event);
                eventManager.emit('shortcut:executed', shortcut);
            } catch (error) {
                console.error('Error executing shortcut:', error);
            }
        }
    }

    handleKeyUp(event) {
        // Clear modifier keys
        if (event.key === 'Shift') this.activeModifiers.delete('shift');
        if (event.key === 'Control') this.activeModifiers.delete('ctrl');
        if (event.key === 'Alt') this.activeModifiers.delete('alt');
        if (event.key === 'Meta') this.activeModifiers.delete('meta');
    }

    clearModifiers() {
        this.activeModifiers.clear();
    }

    buildKeyCombo(event) {
        const parts = [];
        
        if (event.shiftKey) parts.push('shift');
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.metaKey) parts.push('meta');
        
        // Handle special keys
        let key = event.key.toLowerCase();
        if (key === ' ') key = 'space';
        if (key === 'escape') key = 'esc';
        
        parts.push(key);
        
        return parts.join('+');
    }

    getCurrentContext() {
        if (document.querySelector('.videoPlayerContainer:not(.hide)')) {
            return 'player';
        }
        return 'global';
    }

    isTypingInInput(element) {
        const tagName = element.tagName.toLowerCase();
        const inputTypes = ['input', 'textarea', 'select'];
        const editableTypes = ['text', 'password', 'email', 'search', 'url', 'tel'];
        
        if (inputTypes.includes(tagName)) {
            if (tagName === 'input') {
                const type = element.type.toLowerCase();
                return editableTypes.includes(type);
            }
            return true;
        }
        
        return element.contentEditable === 'true' || 
               element.isContentEditable;
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }

    getRegisteredShortcuts() {
        return Array.from(this.shortcuts.entries()).map(([key, shortcut]) => ({
            key,
            ...shortcut
        }));
    }
}

// Global shortcut manager instance
export const shortcutManager = new ShortcutManager();