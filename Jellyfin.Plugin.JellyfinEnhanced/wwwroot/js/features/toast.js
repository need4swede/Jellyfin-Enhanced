// Toast notification system
import { CONSTANTS } from '../core/constants.js';
import { StorageManager } from '../core/storage.js';
import { Utils } from '../core/utils.js';

export class ToastManager {
    constructor() {
        this.container = null;
        this.activeToasts = new Set();
        this.init();
    }

    init() {
        this.createContainer();
    }

    createContainer() {
        this.container = Utils.createElement('div', {
            id: 'jellyfin-enhanced-toast-container',
            style: `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `
        });

        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = null) {
        if (!this.container) return;

        const settings = StorageManager.getSettings();
        const toastDuration = duration || settings.toastDuration || CONSTANTS.DEFAULTS.TOAST_DURATION;

        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        this.activeToasts.add(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Auto remove
        setTimeout(() => {
            this.remove(toast);
        }, toastDuration);

        return toast;
    }

    createToast(message, type) {
        const colors = {
            info: '#00a4dc',
            success: '#52c41a',
            warning: '#faad14',
            error: '#ff4d4f'
        };

        const toast = Utils.createElement('div', {
            className: 'jellyfin-enhanced-toast',
            style: `
                background: ${colors[type] || colors.info};
                color: white;
                padding: 12px 16px;
                border-radius: 6px;
                margin-bottom: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: auto;
                max-width: 300px;
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.4;
            `,
            innerHTML: message
        });

        // Add click to dismiss
        toast.addEventListener('click', () => {
            this.remove(toast);
        });

        return toast;
    }

    remove(toast) {
        if (!this.activeToasts.has(toast)) return;

        this.activeToasts.delete(toast);
        
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    clear() {
        this.activeToasts.forEach(toast => {
            this.remove(toast);
        });
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Global toast manager instance
export const toastManager = new ToastManager();