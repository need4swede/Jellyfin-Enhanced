// /js/jellyseerr/ui.js
(function(JE) {
    'use strict';

    const ui = {};
    const logPrefix = '🪼 Jellyfin Enhanced: Jellyseerr UI:';

    // State variables managed by the main jellyseerr.js, but used by UI functions
    let jellyseerrHoverPopover = null;
    let jellyseerrHoverLock = false;

    // ================================
    // SVG ICONS LIBRARY
    // ================================
    const icons = {
        // Star rating icon (yellow)
        star: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="img" style="color:#ffc107;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>',
        // download_done
        available: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="img" style="margin-left:0.5em;"><polygon points="20.13,5.41 18.72,4 9.53,13.19 5.28,8.95 3.87,10.36 9.53,16.02"/><rect height="2" width="14" x="5" y="18"/></svg>',
        //error
        error: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="img" style="margin-left:0.5em;"><path d="M12 7c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1s-1-.45-1-1V8c0-.55.45-1 1-1zm-.01-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-3h-2v-2h2v2z"/></svg>',
        //cloud_off
        cloud_off: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="img" style="margin-left:0.5em;"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"></path></svg>',
        //person_off
        person_off: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="img" style="margin-left:0.5em;"><path d="M8.65,5.82C9.36,4.72,10.6,4,12,4c2.21,0,4,1.79,4,4c0,1.4-0.72,2.64-1.82,3.35L8.65,5.82z M20,17.17 c-0.02-1.1-0.63-2.11-1.61-2.62c-0.54-0.28-1.13-0.54-1.77-0.76L20,17.17z M20.49,20.49L3.51,3.51c-0.39-0.39-1.02-0.39-1.41,0l0,0 c-0.39,0.39-0.39,1.02,0,1.41l8.18,8.18c-1.82,0.23-3.41,0.8-4.7,1.46C4.6,15.08,4,16.11,4,17.22L4,20h13.17l1.9,1.9 c0.39,0.39,1.02,0.39,1.41,0l0,0C20.88,21.51,20.88,20.88,20.49,20.49z"/></svg>',
        //pending
        pending: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="img" style="margin-left:0.5em;"><path d="M12,2C6.48,2,2,6.48,2,12c0,5.52,4.48,10,10,10s10-4.48,10-10C22,6.48,17.52,2,12,2z M12,20c-4.42,0-8-3.58-8-8 c0-4.42,3.58-8,8-8s8,3.58,8,8C20,16.42,16.42,20,12,20z"/><circle cx="7" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="17" cy="12" r="1.5"/></svg>',
        //calendar_month
        requested: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="img" style="margin-left:0.5em;"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"></path></svg>',
        //check_circle_outline
        partially_available: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="img" style="margin-left:0.5em;"><path d="M9.71 11.29a1 1 0 0 0-1.42 1.42l3 3A1 1 0 0 0 12 16a1 1 0 0 0 .72-.34l7-8a1 1 0 0 0-1.5-1.32L12 13.54z"/><path d="M21 11a1 1 0 0 0-1 1 8 8 0 0 1-8 8A8 8 0 0 1 6.33 6.36 7.93 7.93 0 0 1 12 4a8.79 8.79 0 0 1 1.9.22 1 1 0 1 0 .47-1.94A10.54 10.54 0 0 0 12 2a10 10 0 0 0-7 17.09A9.93 9.93 0 0 0 12 22a10 10 0 0 0 10-10 1 1 0 0 0-1-1z"/></svg>',
        //cancel
        cancel: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="img" style="margin-left:0.5em;"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></svg>',
        //download
        request: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="img" style="margin-right:0.5em;"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>'
    };

    // ================================
    // DOWNLOAD PROGRESS POPOVER SYSTEM
    // ================================

    /**
     * Creates or returns existing hover popover element.
     * Used for showing download progress on hover/focus.
     */
    function ensureHoverPopover() {
        if (!jellyseerrHoverPopover) {
            jellyseerrHoverPopover = document.createElement('div');
            jellyseerrHoverPopover.className = 'jellyseerr-hover-popover';
            document.body.appendChild(jellyseerrHoverPopover);
        }
        return jellyseerrHoverPopover;
    }

    /**
     * Fills popover with download progress information.
     * @param {Object} item - Media item with download status.
     * @returns {HTMLElement|null} - Popover element or null if no download data.
     */
    function fillHoverPopover(item) {
        const downloadStatus = item.mediaInfo?.downloadStatus?.[0] || item.mediaInfo?.downloadStatus4k?.[0];
        if (!downloadStatus || typeof downloadStatus.size !== 'number' || typeof downloadStatus.sizeLeft !== 'number' || downloadStatus.size <= 0) {
            return null;
        }
        const percentage = Math.max(0, Math.min(100, Math.round(100 * (1 - downloadStatus.sizeLeft / downloadStatus.size))));
        const popover = ensureHoverPopover();
        popover.innerHTML = `
            <div class="title">${downloadStatus.title || JE.t('jellyseerr_popover_downloading')}</div>
            <div class="jellyseerr-hover-progress"><div class="bar" style="width:${percentage}%;"></div></div>
            <div class="row">
                <div>${percentage}%</div>
                <div class="status">${(downloadStatus.status || 'downloading').toString().replace(/^./, c => c.toUpperCase())}</div>
            </div>`;
        return popover;
    }

    /**
     * Positions popover to stay within screen bounds.
     * @param {HTMLElement} element - Popover element to position.
     * @param {number} x - Target X coordinate.
     * @param {number} y - Target Y coordinate.
     */
    function positionHoverPopover(element, x, y) {
        const padding = 12;
        const rect = element.getBoundingClientRect();
        let newX = Math.min(Math.max(x + 14, padding), window.innerWidth - rect.width - padding);
        let newY = Math.min(Math.max(y - rect.height - 14, padding), window.innerHeight - rect.height - padding);
        element.style.transform = `translate(${newX}px, ${newY}px)`;
    }

    /**
     * Hides the hover popover (respects mobile lock).
     */
    ui.hideHoverPopover = function() {
        if (jellyseerrHoverPopover && !jellyseerrHoverLock) {
            jellyseerrHoverPopover.classList.remove('show');
        }
    };

    /**
     * Toggles the lock state for the hover popover, used for mobile tap interactions.
     * @param {boolean} [lockState] - Optional state to force lock/unlock. Toggles if omitted.
     */
    ui.toggleHoverPopoverLock = function(lockState) {
        jellyseerrHoverLock = typeof lockState === 'boolean' ? lockState : !jellyseerrHoverLock;
    };

    /**
     * Creates inline download progress display for season items.
     * @param {Object} downloadStatus - Download status object.
     * @returns {HTMLElement|null} - Progress element or null.
     */
    function createInlineProgress(downloadStatus) {
        if (!downloadStatus || typeof downloadStatus.size !== 'number' || typeof downloadStatus.sizeLeft !== 'number' || downloadStatus.size <= 0) {
            return null;
        }
        const percentage = Math.max(0, Math.min(100, Math.round(100 * (1 - downloadStatus.sizeLeft / downloadStatus.size))));
        const progressContainer = document.createElement('div');
        progressContainer.className = 'jellyseerr-inline-progress';
        progressContainer.innerHTML = `
            <div class="jellyseerr-inline-progress-bar"><div class="jellyseerr-inline-progress-fill" style="width: ${percentage}%"></div></div>
            <div class="jellyseerr-inline-progress-text">${percentage}% • ${(downloadStatus.status || 'downloading').replace(/^./, c => c.toUpperCase())}</div>`;
        return progressContainer;
    }

    // ================================
    // STYLING SYSTEM
    // ================================

    /**
     * Adds main CSS styles for Jellyseerr integration.
     */
    ui.addMainStyles = function() {
        const styleId = 'jellyseerr-styles';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* LAYOUT & ICONS */
            .jellyseerr-section { margin-bottom: 1em; }
            .jellyseerr-section .itemsContainer { white-space: nowrap; }
            #jellyseerr-search-icon { position: absolute; right: 10px; top: 68%; transform: translateY(-50%); user-select: none; z-index: 10; transition: filter .2s, opacity .2s, transform .2s; }
            .inputContainer { position: relative !important; }
            .jellyseerr-icon { width: 30px; height: 50px; filter: drop-shadow(2px 2px 6px #000); }
            #jellyseerr-search-icon.is-active { filter: drop-shadow(2px 2px 6px #000); opacity: 1; }
            #jellyseerr-search-icon.is-disabled { filter: grayscale(1); opacity: .8; }
            #jellyseerr-search-icon.is-no-user { filter: hue-rotate(125deg) brightness(100%); }
            #jellyseerr-search-icon.is-filter-active { filter: drop-shadow(2px 2px 6px #3b82f6) brightness(1.2); transform: translateY(-50%) scale(1.1); }
            #jellyseerr-search-icon:hover { transform: translateY(-50%) scale(1.05); transition: transform 0.2s ease; }
            /* CARDS & BADGES */
            .jellyseerr-card { position: relative; }
            .jellyseerr-card .cardScalable { contain: paint; }
            .jellyseerr-icon-on-card { position: absolute; top: 8px; right: 8px; width: 18%; height: auto; z-index: 2; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8)); }
            .jellyseerr-media-badge { position: absolute; top: 8px; left: 8px; z-index: 100; color: #fff; padding: 2px 8px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.2); font-size: 1em; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8); box-shadow: 0 4px 4px -1px rgba(0,0,0,0.1), 0 2px 2px -2px rgba(0,0,0,0.1); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
            .layout-mobile .jellyseerr-media-badge { font-size: 0.8em !important; }
            .jellyseerr-media-badge-movie { background-color: rgba(59, 130, 246, .9); box-shadow: 0 0 0 1px rgba(59,130,246,.35), 0 8px 24px rgba(59,130,246,.25); }
            .jellyseerr-media-badge-series { background-color: rgba(243, 51, 214, .9); box-shadow: 0 0 0 1px rgba(236,72,153,.35), 0 8px 24px rgba(236,72,153,.25); }
            .jellyseerr-overview { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,.78) 75%, rgba(0,0,0,.92) 100%); color: #e5e7eb; padding: 12px 12px 14px; line-height: 1.5; opacity: 0; transform: translateY(6px); transition: opacity .18s ease, transform .18s ease; overflow: hidden; display: flex; align-items: flex-end; backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); }
            .jellyseerr-overview .content { width: 100%; display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; white-space: normal; }
            .jellyseerr-card .cardScalable:hover .jellyseerr-overview, .jellyseerr-card .cardScalable:focus-within .jellyseerr-overview, .jellyseerr-card.is-touch .jellyseerr-overview { opacity: 1; }
            .jellyseerr-overview .title { font-weight: 600; display: block; margin-bottom: .35em; }
            .jellyseerr-elsewhere-icons { display: none; position: absolute; bottom: 0; left:0; right:0; z-index: 3; justify-content: center; gap: 0.6em; pointer-events: none; background: rgba(0,0,0,0.8); border-top-left-radius: 1.5em; border-top-right-radius: 1.5em; padding: 0.5em 0 0.2em 0; }
            .jellyseerr-elsewhere-icons.has-icons {display: flex;}
            .jellyseerr-elsewhere-icons img { width: 1.8em; border-radius: 0.7em; background-color: rgba(255,255,255,0.5); padding: 2px;}
            .jellyseerr-meta { display: flex; justify-content: center; align-items: center; gap: 1.5em; padding: 0 .75em; }
            .jellyseerr-rating { display: flex; align-items: center; gap: .3em; color: #bdbdbd; }
            .cardText-first > a[is="emby-linkbutton"] { padding: 0 !important; margin: 0 !important; color: inherit; text-decoration: none; }
            /* REQUEST BUTTONS */
            .jellyseerr-request-button { width: 100%; display: flex; justify-content: center; align-items: center; white-space: normal; text-align: center; height: 3.5em; padding: 0.2em 0.5em; line-height: 1.2; font-size: 1em; transition: background .2s, border-color .2s, color .2s; }
            .jellyseerr-request-button svg { width: 1.5em; height: 1.5em; flex-shrink: 0; vertical-align: middle; }
            .layout-mobile .jellyseerr-request-button span { font-size: 0.8em !important; }
            .jellyseerr-request-button.jellyseerr-button-offline, .jellyseerr-request-button.jellyseerr-button-no-user { opacity: .6; cursor: not-allowed; }
            .jellyseerr-request-button.jellyseerr-button-request { background-color: #4f46e5 !important; color: #fff !important; }
            .jellyseerr-request-button.jellyseerr-button-pending { background-color: #b45309 !important; color: #fff !important; }
            .jellyseerr-request-button.jellyseerr-button-processing { background-color: #581c87 !important; color: #fff !important; }
            .jellyseerr-request-button.jellyseerr-button-rejected { background-color: #8a1c1c !important; color: #fff !important; }
            .jellyseerr-request-button.jellyseerr-button-partially-available { background-color: #4ca46c !important; color: #fff !important; }
            .jellyseerr-request-button.jellyseerr-button-available { background-color: #16a34a !important; color: #fff !important; }
            .jellyseerr-request-button.jellyseerr-button-error { background: #dc3545 !important; color: #fff !important; }
            .jellyseerr-request-button.jellyseerr-button-tv:not(.jellyseerr-button-available):not(.jellyseerr-button-offline):not(.jellyseerr-button-no-user):not(.jellyseerr-button-error)::after { content: '▼'; margin-left: 6px; font-size: 0.7em; opacity: 0.8; }
            .jellyseerr-season-summary { font-size: 0.85em; opacity: 0.9; display: block; margin-top: 2px; }
            /* SPINNERS & LOADERS */
            .jellyseerr-spinner, .jellyseerr-loading-spinner, .jellyseerr-button-spinner { display: inline-block; border-radius: 50%; animation: jellyseerr-spin 1s linear infinite; }
            .jellyseerr-loading-spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,.3); border-top-color: #fff; margin-left: 10px; vertical-align: middle; }
            .jellyseerr-button-spinner { width: 1em; height: 1em; border: 2px solid currentColor; border-right-color: transparent; margin-left: .5em; flex-shrink: 0; }
            /* HOVER POPOVER STYLES */
            .jellyseerr-hover-popover { position: fixed; min-width: 260px; max-width: 340px; padding: 10px 12px; background: #1f2937; color: #e5e7eb; border-radius: 10px; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,252, .06); opacity: 0; pointer-events: none; transition: opacity .12s ease, transform .12s ease; }
            .jellyseerr-hover-popover.show { opacity: 1; }
            .jellyseerr-hover-popover .title { font-weight: 600; font-size: .9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 8px; }
            .jellyseerr-hover-popover .row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; }
            .jellyseerr-hover-popover .status { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: .75rem; font-weight: 600; background: #4f46e5; color: #fff; }
            .jellyseerr-hover-popover .jellyseerr-hover-progress { height: 7px; width: 100%; background: rgba(255,255,255,.12); border-radius: 999px; overflow: hidden; }
            .jellyseerr-hover-popover .jellyseerr-hover-progress .bar { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); transition: width .2s ease; }
            /* UTILITY CLASSES */
            @keyframes jellyseerr-spin { to { transform: rotate(360deg) } }
            .section-hidden { display: none !important; }
        `;
        document.head.appendChild(style);
    };

    /**
     * Adds enhanced CSS styles for season selection modal.
     */
    ui.addSeasonModalStyles = function() {
        const seasonStyleId = 'jellyseerr-season-styles';
        if (document.getElementById(seasonStyleId)) return;
        const style = document.createElement('style');
        style.id = seasonStyleId;
        style.textContent = `
            /* MODAL STYLES */
            .jellyseerr-season-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 10, 20, 0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 10000; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
            .jellyseerr-season-modal.show { opacity: 1; pointer-events: all; }
            body.jellyseerr-modal-is-open { overflow: hidden; }
            .jellyseerr-season-content { background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 16px; padding: 0; max-width: 700px; width: 90%; max-height: 80vh; overflow: hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(148, 163, 184, 0.05), inset 0 1px 0 rgba(148, 163, 184, 0.1); transform: scale(0.95); transition: transform 0.3s ease; display: flex; flex-direction: column; }
            .jellyseerr-season-modal.show .jellyseerr-season-content { transform: scale(1); }
            .jellyseerr-season-header { position: relative; padding: 24px; border-radius: 16px 16px 0 0; overflow: hidden; height: 8em; flex-shrink: 0; }
            .jellyseerr-season-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; backdrop-filter: blur(2px); background: rgba(0, 0, 0, 0.8); }
            .jellyseerr-season-title { position: relative; font-size: 1.8rem; font-weight: 700; margin-bottom: 6px; background: linear-gradient(45deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .jellyseerr-season-subtitle { position: relative; font-size: 1.4rem; color: rgba(255,255,255,0.9); font-weight: 500; }
            .jellyseerr-modal-body { padding: 24px; overflow-y: auto; }
            .jellyseerr-advanced-options { margin-top: 1em; padding-top: 1em; border-top: 1px solid rgba(148, 163, 184, 0.1); }
            .jellyseerr-advanced-options h3 { margin-top: 0; }
            .jellyseerr-form-row { display: flex; gap: 1em; margin-bottom: 1em; }
            .jellyseerr-form-group { flex: 1; }
            .jellyseerr-form-group label { display: block; margin-bottom: 0.5em; }
            .jellyseerr-form-group select, .jellyseerr-form-group input { width: 100%; padding: 0.5em; border-radius: 4px; border: 1px solid #ccc; }
            .jellyseerr-form-group select[is="emby-select"] { background-color: rgba(30, 41, 59, 0.7) !important; color: #e2e8f0 !important; border: 1px solid rgba(51, 65, 85, 0.5) !important; border-radius: 8px !important; padding: 12px 16px !important; font-size: 0.95rem !important; -webkit-appearance: none; -moz-appearance: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E") !important; background-repeat: no-repeat !important; background-position: right 16px center !important; transition: border-color 0.2s ease, background-color 0.2s ease !important; }
            .jellyseerr-form-group select[is="emby-select"]:hover { border-color: rgba(59, 130, 246, 0.4) !important; background-color: rgba(30, 41, 59, 1) !important; }
            .jellyseerr-season-list { display: grid; gap: 4px; margin-bottom: 24px; }
            .jellyseerr-season-item { display: grid; grid-template-columns: 40px 1fr auto auto; align-items: center; gap: 16px; padding: 16px 20px; background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(51, 65, 85, 0.3); border-radius: 12px; transition: all 0.2s ease; position: relative; }
            .jellyseerr-season-item:hover:not(.disabled) { background: rgba(30, 41, 59, 0.7); border-color: rgba(59, 130, 246, 0.3); transform: translateY(-1px); }
            .jellyseerr-season-item.disabled { background: rgba(15, 23, 42, 0.6); opacity: 0.6; border-color: rgba(51, 65, 85, 0.2); }
            .jellyseerr-season-checkbox { width: 20px; height: 20px; accent-color: #4f46e5; border-radius: 4px; }
            .jellyseerr-season-checkbox:disabled { opacity: 0.4; cursor: not-allowed; }
            .jellyseerr-season-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
            .jellyseerr-season-name { font-weight: 600; color: #e2e8f0; font-size: 1rem; }
            .jellyseerr-season-meta { font-size: 0.875rem; color: #94a3b8; }
            .jellyseerr-season-episodes { font-size: 0.875rem; color: #64748b; text-align: right; min-width: 70px; font-weight: 500; }
            .jellyseerr-season-status { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; min-width: 110px; text-align: center; letter-spacing: 0.5px; border: 1px solid transparent; }
            .jellyseerr-season-status-available { background: rgba(34, 197, 94, 0.15); color: #4ade80; border-color: rgba(34, 197, 94, 0.3); }
            .jellyseerr-season-status-pending { background: rgba(251, 146, 60, 0.15); color: #fb923c; border-color: rgba(251, 146, 60, 0.3); }
            .jellyseerr-season-status-processing { background: rgba(147, 51, 234, 0.15); color: #a855f7; border-color: rgba(147, 51, 234, 0.3); }
            .jellyseerr-season-status-partially-available { background: rgba(34, 197, 94, 0.15); color: #4ade80; border-color: rgba(34, 197, 94, 0.3); }
            .jellyseerr-season-status-not-requested { background: rgba(99, 102, 241, 0.15); color: #818cf8; border-color: rgba(99, 102, 241, 0.3); }
            .jellyseerr-inline-progress { grid-column: 1 / -1; padding: 8px 12px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2); }
            .jellyseerr-inline-progress-bar { height: .5rem; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: .5rem; }
            .jellyseerr-inline-progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); transition: width 0.3s ease; border-radius: 3px; }
            .jellyseerr-inline-progress-text { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
            .jellyseerr-modal-footer { padding: 20px 24px; background: rgba(15, 23, 42, 0.3); border-top: 1px solid rgba(51, 65, 85, 0.3); display: flex; gap: 12px; justify-content: flex-end; flex-shrink: 0; }
            .jellyseerr-modal-button { padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 0.875rem; transition: all 0.2s ease; min-width: 120px; }
            .jellyseerr-modal-button:disabled { opacity: 0.6; cursor: not-allowed; }
            .jellyseerr-modal-button-primary { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
            .jellyseerr-modal-button-primary:hover:not(:disabled) { background: linear-gradient(135deg, #4338ca, #6d28d9); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4); }
            .jellyseerr-modal-button-secondary { background: rgba(71, 85, 105, 0.8); color: #e2e8f0; border: 1px solid rgba(148, 163, 184, 0.2); }
            .jellyseerr-modal-button-secondary:hover { background: rgba(71, 85, 105, 1); border-color: rgba(148, 163, 184, 0.3); }
        `;
        document.head.appendChild(style);
    };

    // ================================
    // UI MANAGEMENT FUNCTIONS
    // ================================

    /**
     * Updates the Jellyseerr icon in the search field based on current state.
     * @param {boolean} isJellyseerrActive - If the server is reachable.
     * @param {boolean} jellyseerrUserFound - If the current user is linked.
     * @param {boolean} isJellyseerrOnlyMode - If the results are filtered.
     * @param {function} onToggleFilter - The function to call to toggle the filter.
     */
    ui.updateJellyseerrIcon = function(isJellyseerrActive, jellyseerrUserFound, isJellyseerrOnlyMode, onToggleFilter) {
        const anchor = document.querySelector('.searchFields .inputContainer') ||
                       document.querySelector('#searchPage .searchFields') ||
                       document.querySelector('#searchPage');
        if (!anchor) return;

        let icon = document.getElementById('jellyseerr-search-icon');
        if (!icon) {
            icon = document.createElement('img');
            icon.id = 'jellyseerr-search-icon';
            icon.className = 'jellyseerr-icon';
            const iconUrl = (JE && JE.pluginConfig && JE.pluginConfig.JellyseerrIconUrl) ? JE.pluginConfig.JellyseerrIconUrl : 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/jellyseerr.svg';
            icon.src = iconUrl;
            icon.alt = 'Jellyseerr';

            let tapCount = 0;
            let tapTimer = null;
            const handleIconInteraction = () => {
                if (!isJellyseerrActive || !jellyseerrUserFound || !onToggleFilter) return;
                tapCount++;
                if (tapCount === 1) {
                    tapTimer = setTimeout(() => { tapCount = 0; }, 300);
                } else if (tapCount === 2) {
                    clearTimeout(tapTimer);
                    tapCount = 0;
                    onToggleFilter();
                }
            };

            icon.addEventListener('click', handleIconInteraction);
            icon.addEventListener('touchend', (e) => { e.preventDefault(); handleIconInteraction(); }, { passive: false });
            icon.setAttribute('tabindex', '0');
            icon.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!isJellyseerrActive || !jellyseerrUserFound || !onToggleFilter) return;
                    onToggleFilter();
                }
            });
            anchor.appendChild(icon);
        }

        icon.classList.remove('is-active', 'is-disabled', 'is-no-user', 'is-filter-active');
        if (isJellyseerrActive && jellyseerrUserFound) {
            icon.title = JE.t(isJellyseerrOnlyMode ? 'jellyseerr_icon_active_filter_tooltip' : 'jellyseerr_icon_active_tooltip');
            icon.classList.add('is-active');
            if (isJellyseerrOnlyMode) icon.classList.add('is-filter-active');
        } else if (isJellyseerrActive && !jellyseerrUserFound) {
            icon.title = JE.t('jellyseerr_icon_no_user_tooltip');
            icon.classList.add('is-no-user');
        } else {
            icon.title = JE.t('jellyseerr_icon_disabled_tooltip');
            icon.classList.add('is-disabled');
        }
    };

    /**
     * Analyzes season statuses to determine overall show status.
     * @param {Array} seasons - Array of season objects with status information.
     * @returns {object} - Analysis result with overall status and summary.
     */
    function analyzeSeasonStatuses(seasons) {
        if (!seasons || seasons.length === 0) return { overallStatus: 1, statusSummary: null, total: 0 };
        const regularSeasons = seasons.filter(s => s.seasonNumber > 0);
        const total = regularSeasons.length;
        if (total === 0) return { overallStatus: 1, statusSummary: null, total: 0 };

        const statusCounts = {
            available: regularSeasons.filter(s => s.status === 5).length,
            pending: regularSeasons.filter(s => s.status === 2).length,
            processing: regularSeasons.filter(s => s.status === 3).length,
            partiallyAvailable: regularSeasons.filter(s => s.status === 4).length,
            notRequested: regularSeasons.filter(s => s.status === 1).length
        };
        const requestedCount = statusCounts.pending + statusCounts.processing;
        const availableCount = statusCounts.available + statusCounts.partiallyAvailable;
        const accountedForCount = requestedCount + availableCount;
        let overallStatus, statusSummary = null;

        if (statusCounts.notRequested === 0) {
            overallStatus = (availableCount === total) ? 5 : 7;
            if (overallStatus === 7) statusSummary = JE.t('jellyseerr_seasons_accounted_for', { count: accountedForCount, total });
        } else if (accountedForCount > 0) {
            overallStatus = (availableCount > 0) ? 4 : 3;
            statusSummary = (availableCount > 0) ? JE.t('jellyseerr_seasons_available_count', { count: availableCount, total }) : JE.t('jellyseerr_seasons_requested_count', { count: requestedCount, total });
        } else {
            overallStatus = 1;
        }
        return { overallStatus, statusSummary, total };
    }

    /**
     * Renders Jellyseerr search results into the search page with improved placement logic.
     * @param {Array} results - Array of search result items.
     * @param {string} query - The search query that generated these results.
     * @param {boolean} isJellyseerrOnlyMode - Whether the filter is active.
     * @param {boolean} isJellyseerrActive - If the server is reachable.
     * @param {boolean} jellyseerrUserFound - If the current user is linked.
     */
    ui.renderJellyseerrResults = function(results, query, isJellyseerrOnlyMode, isJellyseerrActive, jellyseerrUserFound) {
        console.log(`${logPrefix} Rendering results for query: "${query}"`);
        const searchPage = document.querySelector('#searchPage');
        if (!searchPage) {
            console.warn(`${logPrefix} #searchPage not found. Cannot render results.`);
            return;
        }

        const oldSection = searchPage.querySelector('.jellyseerr-section');
        if(oldSection) oldSection.remove();

        const sectionToInject = createJellyseerrSection(results, isJellyseerrOnlyMode, isJellyseerrActive, jellyseerrUserFound);

        const primarySectionKeywords = ['movies', 'shows', 'film', 'serier', 'filme', 'serien', 'películas', 'series', 'films', 'séries', 'serie tv'];

        let attempts = 0;
        const maxAttempts = 75; // ~15 seconds

        const injectionInterval = setInterval(() => {
            attempts++;
            const noResultsMessage = searchPage.querySelector('.noItemsMessage');
            const allSections = Array.from(searchPage.querySelectorAll('.verticalSection:not(.jellyseerr-section)'));
            const hasContent = allSections.length > 0;

            if ((hasContent || noResultsMessage) || attempts >= maxAttempts) {
                clearInterval(injectionInterval);

                if (noResultsMessage) {
                    noResultsMessage.textContent = JE.t('jellyseerr_no_results_jellyfin', { query });
                    noResultsMessage.parentElement.insertBefore(sectionToInject, noResultsMessage.nextSibling);
                    return;
                }

                let lastPrimarySection = null;
                for (let i = allSections.length - 1; i >= 0; i--) {
                    const section = allSections[i];
                    const title = section.querySelector('.sectionTitle')?.textContent.trim().toLowerCase();
                    if (title && primarySectionKeywords.some(keyword => title.includes(keyword))) {
                        lastPrimarySection = section;
                        break;
                    }
                }

                if (lastPrimarySection) {
                    lastPrimarySection.after(sectionToInject);
                } else {
                    const resultsContainer = searchPage.querySelector('.searchResults, [class*="searchResults"], .padded-top.padded-bottom-page');
                    if (resultsContainer) {
                        resultsContainer.prepend(sectionToInject);
                    } else {
                        searchPage.appendChild(sectionToInject); // Fallback
                    }
                }
            }
        }, 200);
    };

    /**
     * Creates the main Jellyseerr results section.
     * @param {Array} results - Array of search result items.
     * @param {boolean} isJellyseerrOnlyMode - Whether the filter is active.
     * @param {boolean} isJellyseerrActive - If the server is reachable.
     * @param {boolean} jellyseerrUserFound - If the current user is linked.
     * @returns {HTMLElement} - Section element.
     */
    function createJellyseerrSection(results = [], isJellyseerrOnlyMode, isJellyseerrActive, jellyseerrUserFound) {
        const section = document.createElement('div');
        section.className = 'verticalSection emby-scroller-container jellyseerr-section';
        section.setAttribute('data-jellyseerr-section', 'true');

        const title = document.createElement('h2');
        title.className = 'sectionTitle sectionTitle-cards focuscontainer-x padded-left padded-right';
        title.textContent = isJellyseerrOnlyMode ? JE.t('jellyseerr_results_title') : JE.t('jellyseerr_discover_title');
        section.appendChild(title);

        const scrollerContainer = document.createElement('div');
        scrollerContainer.setAttribute('is', 'emby-scroller');
        scrollerContainer.className = 'padded-top-focusscale padded-bottom-focusscale emby-scroller';
        scrollerContainer.dataset.horizontal = "true";
        scrollerContainer.dataset.centerfocus = "card";

        const itemsContainer = document.createElement('div');
        itemsContainer.setAttribute('is', 'emby-itemscontainer');
        itemsContainer.className = 'focuscontainer-x itemsContainer scrollSlider';

        results.forEach(item => {
            const card = createJellyseerrCard(item, isJellyseerrActive, jellyseerrUserFound);
            itemsContainer.appendChild(card);
        });

        scrollerContainer.appendChild(itemsContainer);
        section.appendChild(scrollerContainer);
        return section;
    }

    /**
     * Creates an individual Jellyseerr result card.
     * @param {Object} item - Search result item from Jellyseerr API.
     * @param {boolean} isJellyseerrActive - If the server is reachable.
     * @param {boolean} jellyseerrUserFound - If the current user is linked.
     * @returns {HTMLElement} - Card element.
     */
    function createJellyseerrCard(item, isJellyseerrActive, jellyseerrUserFound) {
        const year = item.releaseDate?.substring(0, 4) || item.firstAirDate?.substring(0, 4) || 'N/A';
        const posterUrl = item.posterPath ? `https://image.tmdb.org/t/p/w400${item.posterPath}` : 'https://i.ibb.co/fdbkXQdP/jellyseerr-poster-not-found.png';
        const rating = item.voteAverage ? item.voteAverage.toFixed(1) : 'N/A';
        const titleText = item.title || item.name;
        const tmdbUrl = `https://www.themoviedb.org/${item.mediaType}/${item.id}`;

        const card = document.createElement('div');
        card.className = 'card overflowPortraitCard card-hoverable card-withuserdata jellyseerr-card';
        const jellyseerrIconUrl = (JE && JE.pluginConfig && JE.pluginConfig.JellyseerrIconUrl) ? JE.pluginConfig.JellyseerrIconUrl : 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/jellyseerr.svg';
        card.innerHTML = `
            <div class="cardBox cardBox-bottompadded">
                <div class="cardScalable">
                    <div class="cardPadder cardPadder-overflowPortrait"></div>
                    <div class="cardImageContainer coveredImage cardContent itemAction" style="background-image: url('${posterUrl}');">
                        <img src="${jellyseerrIconUrl}" class="jellyseerr-icon-on-card" alt="Jellyseerr"/>
                        <div class="jellyseerr-elsewhere-icons"></div>
                        <div class="cardIndicators"></div>
                    </div>
                    <div class="cardOverlayContainer" data-action="link"></div>
                    <div class="jellyseerr-overview"><div class="content">${((item.overview || JE.t('jellyseerr_card_no_info')).slice(0, 500))}</div></div>
                </div>
                <div class="cardText cardTextCentered cardText-first">
                    <a is="emby-linkbutton" href="${tmdbUrl}" target="_blank" rel="noopener noreferrer" title="${JE.t('jellyseerr_card_view_on_tmdb')}"><bdi>${titleText}</bdi></a>
                </div>
                <div class="cardText cardTextCentered cardText-secondary jellyseerr-meta">
                    <bdi>${year}</bdi>
                    <div class="jellyseerr-rating">${icons.star}<span>${rating}</span></div>
                </div>
                <div class="cardFooter" style="padding: 0.5em 1em 1em;">
                    <button is="emby-button" type="button" class="jellyseerr-request-button emby-button" data-tmdb-id="${item.id}" data-media-type="${item.mediaType}"></button>
                </div>
            </div>`;

        const imageContainer = card.querySelector('.cardImageContainer');
        if (imageContainer) {
            imageContainer.addEventListener('touchend', (e) => { e.preventDefault(); card.classList.toggle('is-touch'); }, { passive: false });
            imageContainer.setAttribute('tabindex', '0');
            imageContainer.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('is-touch'); } });
        }

        const button = card.querySelector('.jellyseerr-request-button');
        configureRequestButton(button, item, isJellyseerrActive, jellyseerrUserFound);
        addMediaTypeBadge(card, item);

        if (JE.pluginConfig.ShowElsewhereOnJellyseerr && JE.pluginConfig.TMDB_API_KEY) {
            fetchProviderIcons(card.querySelector('.jellyseerr-elsewhere-icons'), item.id, item.mediaType);
        }
        return card;
    }

    /**
     * Fetches streaming provider icons from the TMDB API and adds them to a specified container element on a Jellyseerr poster.
     * This function is called only if the "Show Elsewhere on Jellyseerr" setting is enabled and a TMDB API key is present.
     * It retrieves providers based on the default region and filters configured in the Elsewhere plugin settings.
     *
     * @async
     * @function fetchProviderIcons
     * @param {HTMLElement} container - The DOM element where the provider icons will be appended.
     * @param {string|number} tmdbId - The The Movie Database (TMDB) ID for the movie or TV show.
     * @param {string} mediaType - The type of media, either 'movie' or 'tv'.
     * @returns {Promise<void>} A promise that resolves when the icons have been fetched and added, or if the process fails.
     */
    async function fetchProviderIcons(container, tmdbId, mediaType) {
        if (!container || !tmdbId || !mediaType) return;

        const TMDB_API_KEY = JE.pluginConfig.TMDB_API_KEY;
        const DEFAULT_REGION = JE.pluginConfig.DEFAULT_REGION || 'US';
        const DEFAULT_PROVIDERS = JE.pluginConfig.DEFAULT_PROVIDERS ? JE.pluginConfig.DEFAULT_PROVIDERS.replace(/'/g, '').replace(/\n/g, ',').split(',').map(s => s.trim()).filter(s => s) : [];
        const IGNORE_PROVIDERS = JE.pluginConfig.IGNORE_PROVIDERS ? JE.pluginConfig.IGNORE_PROVIDERS.replace(/'/g, '').replace(/\n/g, ',').split(',').map(s => s.trim()).filter(s => s) : [];

        try {
            const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`);
            if (!response.ok) return;

            const data = await response.json();
            let providers = data.results?.[DEFAULT_REGION]?.flatrate;

            if (providers && providers.length > 0) {

                // 1. If a default provider list is set, only include providers from that list.
                if (DEFAULT_PROVIDERS.length > 0) {
                    providers = providers.filter(provider => DEFAULT_PROVIDERS.includes(provider.provider_name));
                }

                // 2. If an ignore list is set, exclude any providers that match.
                if (IGNORE_PROVIDERS.length > 0) {
                    try {
                        const ignorePatterns = IGNORE_PROVIDERS.map(pattern => new RegExp(pattern, 'i'));
                        providers = providers.filter(provider =>
                            !ignorePatterns.some(regex => regex.test(provider.provider_name))
                        );
                    } catch (e) {
                        console.error(`${logPrefix} Invalid regex in IGNORE_PROVIDERS setting.`, e);
                    }
                }

                if (providers.length > 0) {
                    providers.slice(0, 4).forEach(provider => { // Limit to max 4 icons to avoid clutter
                        const img = document.createElement('img');
                        img.src = `https://image.tmdb.org/t/p/w92${provider.logo_path}`;
                        img.title = provider.provider_name;
                        container.appendChild(img);
                    });

                    if (container.childElementCount > 0) {
                        container.classList.add('has-icons');
                    }
                }
            }
        } catch (error) {
            console.warn(`${logPrefix} Could not fetch provider icons for TMDB ID ${tmdbId}:`, error);
        }
    }

    /**
     * Configures the request button based on item status and type.
     * @param {HTMLElement} button - Button element to configure.
     * @param {Object} item - Media item data.
     * @param {boolean} isJellyseerrActive - If the server is reachable.
     * @param {boolean} jellyseerrUserFound - If the current user is linked.
     */
    function configureRequestButton(button, item, isJellyseerrActive, jellyseerrUserFound) {
        if (!isJellyseerrActive) {
            button.innerHTML = `<span>${JE.t('jellyseerr_btn_offline')}</span>${icons.cloud_off}`;
            button.disabled = true;
            button.classList.add('jellyseerr-button-offline');
            return;
        }
        if (!jellyseerrUserFound) {
            button.innerHTML = `<span>${JE.t('jellyseerr_btn_user_not_found')}</span>${icons.person_off}`;
            button.disabled = true;
            button.classList.add('jellyseerr-button-no-user');
            return;
        }

        if (item.mediaType === 'tv') {
            button.dataset.searchResultItem = JSON.stringify(item);
            button.classList.add('jellyseerr-button-tv');
            if (item.mediaInfo) button.dataset.mediaInfo = JSON.stringify(item.mediaInfo);
            const seasonAnalysis = item.mediaInfo?.seasons ? analyzeSeasonStatuses(item.mediaInfo.seasons) : null;
            const overallStatus = seasonAnalysis ? seasonAnalysis.overallStatus : (item.mediaInfo ? item.mediaInfo.status : 1);
            configureTvShowButton(button, overallStatus, seasonAnalysis, item);
        } else {
            configureMovieButton(button, item);
        }
    }

    /**
     * Configures button for TV shows based on season analysis.
     * @param {HTMLElement} button - Button element.
     * @param {number} overallStatus - Calculated overall status.
     * @param {Object|null} seasonAnalysis - Season analysis results.
     */
    function configureTvShowButton(button, overallStatus, seasonAnalysis) {
        const setButton = (text, icon, className, disabled = false, summary = seasonAnalysis?.statusSummary) => {
            button.innerHTML = `${icon || ''}<span>${text}</span>`;
            if (summary) button.innerHTML += `<div class="jellyseerr-season-summary">${summary}</div>`;
            button.disabled = disabled;
            button.classList.add('button-submit', className);
        };
        switch (overallStatus) {
            case 2: setButton(JE.t('jellyseerr_btn_pending'), icons.pending, 'jellyseerr-button-pending'); break;
            case 3: setButton(JE.t('jellyseerr_btn_request_more'), icons.request, 'jellyseerr-button-request'); break;
            case 7: setButton(JE.t('jellyseerr_btn_view_status'), icons.requested, 'jellyseerr-button-pending'); break;
            case 4: setButton(JE.t('jellyseerr_btn_request_missing'), icons.request, 'jellyseerr-button-partially-available'); break;
            case 5: setButton(JE.t('jellyseerr_btn_available'), icons.available, 'jellyseerr-button-available', true, seasonAnalysis?.total > 1 ? JE.t('jellyseerr_all_seasons', {count: seasonAnalysis.total}) : null); break;
            case 6: setButton(JE.t('jellyseerr_btn_rejected'), icons.cancel, 'jellyseerr-button-rejected', true); break;
            default: setButton(JE.t('jellyseerr_btn_request'), icons.request, 'jellyseerr-button-request', false, seasonAnalysis?.total > 1 ? JE.t('jellyseerr_seasons_available', {count: seasonAnalysis.total}) : null); break;
        }
    }

    /**
     * Configures button for movies.
     * @param {HTMLElement} button - Button element.
     * @param {Object} item - Movie item data.
     */
    function configureMovieButton(button, item) {
        button.dataset.searchResultItem = JSON.stringify(item);
        const status = item.mediaInfo ? item.mediaInfo.status : 1;
        const setButton = (text, icon, className, disabled = false) => {
            button.innerHTML = `${icon || ''}<span>${text}</span>`;
            button.disabled = disabled;
            button.classList.add('button-submit', className);
        };
        switch (status) {
            case 2: setButton(JE.t('jellyseerr_btn_pending'), icons.pending, 'jellyseerr-button-pending', true); break;
            case 3:
                if (item.mediaInfo?.downloadStatus?.length > 0 || item.mediaInfo?.downloadStatus4k?.length > 0) {
                    button.innerHTML = `<span>${JE.t('jellyseerr_btn_processing')}</span><span class="jellyseerr-button-spinner"></span>`;
                    button.disabled = true;
                    button.classList.add('button-submit', 'jellyseerr-button-processing');
                    addDownloadProgressHover(button, item);
                } else {
                    setButton(JE.t('jellyseerr_btn_requested'), icons.requested, 'jellyseerr-button-pending', true);
                }
                break;
            case 4: setButton(JE.t('jellyseerr_btn_partially_available'), icons.partially_available, 'jellyseerr-button-partially-available', true); break;
            case 5: setButton(JE.t('jellyseerr_btn_available'), icons.available, 'jellyseerr-button-available', true); break;
            case 6: setButton(JE.t('jellyseerr_btn_rejected'), icons.cancel, 'jellyseerr-button-rejected', true); break;
            default: setButton(JE.t('jellyseerr_btn_request'), icons.request, 'jellyseerr-button-request'); break;
        }
    }

    /**
     * Adds download progress hover functionality to a button.
     * @param {HTMLElement} button - Button element.
     * @param {Object} item - Media item with download status.
     */
    function addDownloadProgressHover(button, item) {
        button.addEventListener('mouseenter', (e) => {
            const popover = fillHoverPopover(item);
            if (popover) {
                positionHoverPopover(popover, e.clientX, e.clientY);
                popover.classList.add('show');
            }
        });
        button.addEventListener('mousemove', (e) => {
            if (jellyseerrHoverPopover?.classList.contains('show') && !jellyseerrHoverLock) {
                positionHoverPopover(jellyseerrHoverPopover, e.clientX, e.clientY);
            }
        });
        button.addEventListener('mouseleave', ui.hideHoverPopover);
        button.addEventListener('focus', () => {
            const popover = fillHoverPopover(item);
            if (popover) {
                const rect = button.getBoundingClientRect();
                positionHoverPopover(popover, rect.right, rect.top - 8);
                popover.classList.add('show');
            }
        });
        button.addEventListener('blur', () => {
            ui.toggleHoverPopoverLock(false);
            ui.hideHoverPopover();
        });
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const popover = fillHoverPopover(item);
            if (popover) {
                const rect = button.getBoundingClientRect();
                ui.toggleHoverPopoverLock();
                if (jellyseerrHoverLock) {
                    positionHoverPopover(popover, rect.left + rect.width / 2, rect.top - 8);
                    popover.classList.add('show');
                } else {
                    popover.classList.remove('show');
                }
            }
        }, { passive: false });
    }

    /**
     * Adds media type badge to card.
     * @param {HTMLElement} card - Card element.
     * @param {Object} item - Media item data.
     */
    function addMediaTypeBadge(card, item) {
        if (item.mediaType === 'movie' || item.mediaType === 'tv') {
            const imageContainer = card.querySelector('.cardImageContainer');
            if (imageContainer) {
                const badge = document.createElement('div');
                badge.className = 'jellyseerr-media-badge';
                if (item.mediaType === 'movie') {
                    badge.classList.add('jellyseerr-media-badge-movie');
                    badge.textContent = JE.t('jellyseerr_card_badge_movie');
                } else {
                    badge.classList.add('jellyseerr-media-badge-series');
                    badge.textContent = JE.t('jellyseerr_card_badge_series');
                }
                imageContainer.appendChild(badge);
            }
        }
    }

    /**
     * Shows the advanced request modal for movies.
     * @param {number} tmdbId - TMDB ID of the movie.
     * @param {string} title - Display title of the movie.
     * @param {Object|null} searchResultItem - Original search result data.
     */
    ui.showMovieRequestModal = async function(tmdbId, title, searchResultItem) {
        const { create, createAdvancedOptionsHTML, populateAdvancedOptions } = JE.jellyseerrModal;
        const { requestMedia, fetchAdvancedRequestData } = JE.jellyseerrAPI;

        const bodyHtml = createAdvancedOptionsHTML('movie');
        const { modalElement, show } = create({
            title: JE.t('jellyseerr_modal_title_movie'),
            subtitle: title,
            bodyHtml,
            backdropPath: searchResultItem?.backdropPath,
            onSave: async (modalEl, requestBtn, closeFn) => {
                const serverSelect = modalEl.querySelector('#movie-server');
                const qualitySelect = modalEl.querySelector('#movie-quality');
                const folderSelect = modalEl.querySelector('#movie-folder');

                if (!serverSelect.value || !qualitySelect.value || !folderSelect.value) {
                    JE.toast(JE.t('jellyseerr_modal_toast_options_missing'), 3000);
                    return;
                }

                requestBtn.disabled = true;
                requestBtn.innerHTML = `${JE.t('jellyseerr_modal_requesting')}<span class="jellyseerr-button-spinner"></span>`;
                const settings = { serverId: parseInt(serverSelect.value), profileId: parseInt(qualitySelect.value), rootFolder: folderSelect.value, tags: [] };

                try {
                    await requestMedia(tmdbId, 'movie', settings);
                    // Manually update the original button on the card
                    const originalButton = document.querySelector(`.jellyseerr-request-button[data-tmdb-id="${tmdbId}"]`);
                    if (originalButton) {
                        originalButton.innerHTML = `<span>${JE.t('jellyseerr_btn_requested')}</span>${icons.requested}`;
                        originalButton.classList.remove('jellyseerr-button-request');
                        originalButton.classList.add('jellyseerr-button-pending');
                    }
                    closeFn();
                } catch (error) {
                    JE.toast(JE.t('jellyseerr_modal_toast_request_fail'), 4000);
                    requestBtn.disabled = false;
                    requestBtn.textContent = JE.t('jellyseerr_modal_request');
                }
            }
        });
        show();
        try {
            const data = await fetchAdvancedRequestData('movie');
            populateAdvancedOptions(modalElement, data, 'movie');
        } catch (error) {
            console.error(`${logPrefix} Failed to load advanced options:`, error);
            JE.toast('Failed to load server options', 3000);
        }
    };

    /**
     * Shows the enhanced season selection modal for TV shows.
     * @param {number} tmdbId - TMDB ID of the TV show.
     * @param {string} mediaType - Should be 'tv'.
     * @param {string} showTitle - Display title of the show.
     * @param {Object|null} searchResultItem - Original search result data.
     */
    ui.showSeasonSelectionModal = async function(tmdbId, mediaType, showTitle, searchResultItem = null) {
        if (mediaType !== 'tv') return;

        const { create, createAdvancedOptionsHTML, populateAdvancedOptions } = JE.jellyseerrModal;
        const { fetchTvShowDetails, requestTvSeasons, fetchAdvancedRequestData } = JE.jellyseerrAPI;

        const tvDetails = await fetchTvShowDetails(tmdbId);
        if (!tvDetails?.seasons) {
            JE.toast(JE.t('jellyseerr_toast_no_season_info'), 4000);
            return;
        }

        const showAdvanced = JE.pluginConfig.JellyseerrShowAdvanced;
        const bodyHtml = `<div class="jellyseerr-season-list"></div>${showAdvanced ? createAdvancedOptionsHTML('tv') : ''}`;

        const { modalElement, show } = create({
            title: JE.t('jellyseerr_modal_title'),
            subtitle: showTitle,
            bodyHtml,
            backdropPath: tvDetails.backdropPath,
            onSave: async (modalEl, requestBtn, closeFn) => {
                const selectedSeasons = Array.from(modalEl.querySelectorAll('.jellyseerr-season-checkbox:checked')).map(cb => parseInt(cb.dataset.seasonNumber));
                if (selectedSeasons.length === 0) {
                    JE.toast(JE.t('jellyseerr_modal_toast_select_season'), 3000);
                    return;
                }
                requestBtn.disabled = true;
                requestBtn.innerHTML = `${JE.t('jellyseerr_modal_requesting')}<span class="jellyseerr-button-spinner"></span>`;

                let settings = {};
                if (showAdvanced) {
                    const server = modalEl.querySelector('#tv-server').value;
                    const quality = modalEl.querySelector('#tv-quality').value;
                    const folder = modalEl.querySelector('#tv-folder').value;
                    if (!server || !quality || !folder) {
                        JE.toast(JE.t('jellyseerr_modal_toast_options_missing'), 3000);
                        requestBtn.disabled = false;
                        requestBtn.textContent = JE.t('jellyseerr_modal_request_selected');
                        return;
                    }
                    settings = { serverId: parseInt(server), profileId: parseInt(quality), rootFolder: folder, tags: [] };
                }

                try {
                    await requestTvSeasons(tmdbId, selectedSeasons, settings);
                    JE.toast(JE.t('jellyseerr_modal_toast_request_success', { count: selectedSeasons.length, title: showTitle }), 4000);
                    closeFn();
                    setTimeout(() => {
                        const query = new URLSearchParams(window.location.hash.split('?')[1])?.get('query');
                        if (query) {
                            const mainController = JE.jellyseerr;
                            if (mainController) {
                                mainController.fetchAndRenderResults(query);
                            }
                        }
                    }, 1000);
                } catch (error) {
                    JE.toast(JE.t('jellyseerr_modal_toast_request_fail'), 4000);
                    requestBtn.disabled = false;
                    requestBtn.textContent = JE.t('jellyseerr_modal_request_selected');
                }
            }
        });

        // Populate season list inside the modal
        const seasonList = modalElement.querySelector('.jellyseerr-season-list');
        const seasonStatusMap = {};
        tvDetails.mediaInfo?.seasons?.forEach(s => { seasonStatusMap[s.seasonNumber] = s.status; });
        tvDetails.mediaInfo?.requests?.forEach(r => r.seasons?.forEach(sr => { seasonStatusMap[sr.seasonNumber] = sr.status; }));

        tvDetails.seasons.filter(s => s.seasonNumber > 0).forEach(season => {
            const apiStatus = seasonStatusMap[season.seasonNumber];
            const canRequest = !apiStatus || apiStatus === 1;
            const seasonItem = document.createElement('div');
            seasonItem.className = `jellyseerr-season-item ${canRequest ? '' : 'disabled'}`;
            let statusText = JE.t('jellyseerr_season_status_not_requested'), statusClass = 'not-requested';
            switch (apiStatus) {
                case 2:
                case 3: statusText = JE.t('jellyseerr_season_status_requested'); statusClass = 'processing'; break;
                case 4: statusText = JE.t('jellyseerr_season_status_partial'); statusClass = 'partially-available'; break;
                case 5: statusText = JE.t('jellyseerr_season_status_available'); statusClass = 'available'; break;
            }
            if ((apiStatus === 2 || apiStatus === 3) && tvDetails.mediaInfo?.downloadStatus?.some(ds => ds.episode?.seasonNumber === season.seasonNumber)) {
                statusText = JE.t('jellyseerr_season_status_processing');
            }
            seasonItem.innerHTML = `
                <input type="checkbox" class="jellyseerr-season-checkbox" data-season-number="${season.seasonNumber}" ${canRequest ? '' : 'disabled'}>
                <div class="jellyseerr-season-info">
                    <div class="jellyseerr-season-name">${season.name || `Season ${season.seasonNumber}`}</div>
                    <div class="jellyseerr-season-meta">${season.airDate ? season.airDate.substring(0, 4) : ''}</div>
                </div>
                <div class="jellyseerr-season-episodes">${season.episodeCount || 0} ep</div>
                <div class="jellyseerr-season-status jellyseerr-season-status-${statusClass}">${statusText}</div>`;

            // Add inline download progress
            if ((apiStatus === 2 || apiStatus === 3) && tvDetails.mediaInfo?.downloadStatus?.length > 0) {
                const seasonDownloads = tvDetails.mediaInfo.downloadStatus.filter(ds => ds.episode?.seasonNumber === season.seasonNumber);
                if (seasonDownloads.length > 0) {
                    const totalSize = seasonDownloads.reduce((sum, ds) => sum + (ds.size || 0), 0);
                    const totalSizeLeft = seasonDownloads.reduce((sum, ds) => sum + (ds.sizeLeft || 0), 0);
                    if (totalSize > 0) {
                        const aggregatedStatus = { size: totalSize, sizeLeft: totalSizeLeft, status: `${seasonDownloads.length} episode(s) downloading` };
                        const progressElement = createInlineProgress(aggregatedStatus);
                        if (progressElement) seasonItem.appendChild(progressElement);
                    }
                }
            }
            seasonList.appendChild(seasonItem);
        });

        show();

        if (showAdvanced) {
            try {
                const data = await fetchAdvancedRequestData('tv');
                populateAdvancedOptions(modalElement, data, 'tv');
            } catch (error) {
                console.error(`${logPrefix} Failed to load TV advanced options:`, error);
                JE.toast('Failed to load server options', 3000);
            }
        }
    };

    // Expose the UI module on the global JE object
    ui.icons = icons;
    JE.jellyseerrUI = ui;

})(window.JellyfinEnhanced);
