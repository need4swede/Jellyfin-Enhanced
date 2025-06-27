// ==UserScript==
// @name         Jellyfin Shortcuts (/, A, I, Esc)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  / = search,  A = aspect-ratio cycle,  I = playback info,  Esc = home
// @match        *://*/web/*
// @author       n00bcodr
// @grant        none
// @downloadURL  https://github.com/n00bcodr/jellyfin-hotkeys/raw/main/jellyfin-hotkeys.user.js
// @updateURL    https://github.com/n00bcodr/jellyfin-hotkeys/raw/main/jellyfin-hotkeys.user.js
// ==/UserScript==

(function () {
    'use strict';

    /* ------------ helpers ------------ */
    const isVideoPage = () => location.hash.startsWith('#/video');
    const settingsBtn = () => document.querySelector('button[title="Settings"],button[aria-label="Settings"]');
    const actionSheetOpen = () => document.querySelector('.actionSheetContent');

    const openSettings = (cb) => {
        settingsBtn()?.click();
        setTimeout(cb, 120);
    };

    const toast = (txt) => {
        const t = document.createElement('div');
        Object.assign(t.style, {
            position: 'fixed', bottom: '50%', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '6px 12px',
            borderRadius: '4px', zIndex: 9999, fontSize: '20px'
        });
        t.textContent = txt;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 1400);
    };

    /* ------------ aspect ratio cycle ------------ */
    const cycleAspect = () => {
        const opts = [...document.querySelectorAll(
            '.actionSheetContent button[data-id="auto"],' +
            '.actionSheetContent button[data-id="cover"],' +
            '.actionSheetContent button[data-id="fill"]'
        )];
        if (!opts.length) {
            document.querySelector('.actionSheetContent button[data-id="aspectratio"]')?.click();
            return setTimeout(cycleAspect, 120);
        }
        const current = opts.findIndex(b => b.querySelector('.check') && b.querySelector('.check').style.visibility !== 'hidden');
        const next = opts[(current + 1) % opts.length];
        next?.click();
        toast(next?.textContent.trim());
    };

    /* ------------ hotkeys ------------ */
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        /* /  → search */
        if (e.key === '/' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            document.querySelector('button.headerSearchButton')?.click();
            return setTimeout(() => document.querySelector('input[type="search"]')?.focus(), 100);
        }

        /* Esc → home */
        if (e.key === 'Escape') {
            e.preventDefault();
            return (location.href = '/web/#/home.html');
        }

        if (!isVideoPage()) return; // A & I only on video page
        const k = e.key.toLowerCase();

        /* A → cycle aspect ratio */
        if (k === 'a') {
            e.preventDefault();
            return openSettings(cycleAspect);
        }

        /* I → playback info */
        if (k === 'i') {
            e.preventDefault();
            openSettings(() => {
                document.querySelector('.actionSheetContent button[data-id="stats"]')?.click();
            });
        }
    });

    /* ------------ auto-pause on tab visibility change ------------ */
    document.addEventListener('visibilitychange', () => {
        const v = document.querySelector('video');
        if (document.hidden && v && !v.paused) v.pause();
    });
})();
