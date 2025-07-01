(function () {
    'use strict';

    /* ------------ helpers ------------ */
    const isVideoPage = () => location.hash.startsWith('#/video');
    const settingsBtn = () => document.querySelector('button[title="Settings"],button[aria-label="Settings"]');

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

    /* ------------ aspect ratio cycle function ------------ */
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
        /* / → open search */
        if (e.key === '/' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            document.querySelector('button.headerSearchButton')?.click();
            return setTimeout(() => document.querySelector('input[type="search"]')?.focus(), 100);
        }
        /* Shift + Esc → go to Home */
        if (e.key === 'Escape' && e.shiftKey) {
            e.preventDefault();
            return (location.href = '/web/#/home.html'); /*this might have to be changed in Jellyfin 10.10 */
        }

        /* ? → show help dialog */
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
            e.preventDefault(); e.stopPropagation();
            if (document.getElementById('hotkeyHelpOverlay')) return;

            const help = document.createElement('div');
            help.id = 'hotkeyHelpOverlay';
            help.style = `
                position: fixed; top: 10%; left: 50%; transform: translateX(-50%);
                background: rgba(0,0,0,0.7); color: #fff; padding: 30px;
                border-radius: 12px; z-index: 9999; font-size: 18px; backdrop-filter: blur(15px);
                max-width: 90%; line-height: 2; box-shadow: 0 0 20px rgba(0,0,0,0.5);
            `;
            help.innerHTML = `
                <div style="font-size: 24px; color: #fff; margin-bottom: 10px;"><b><u>Jellyfin Hotkeys</u></b></div>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding-right: 20px;">/</td><td>Open Search Page</td></tr>
                    <tr><td>A</td><td>Cycle aspect ratio</td></tr>
                    <tr><td>I</td><td>Show/hide playback info</td></tr>
                    <tr><td>S</td><td>Show subtitle menu</td></tr>
                    <tr><td>Shift + Esc</td><td>Go to Home</td></tr>
                </table>
                <div style="margin-top: 15px; font-size: 13px; color: #888; text-align: center;">
                    Press <b>?</b> or <b>Esc</b> to close · Auto hides in 8s
                </div>
                <div style="margin-top: 15px; text-align: center; border-top: 1px solid #444; padding-top: 20px;">
                    <a href="https://github.com/n00bcodr/Jellyfin-hotkeys" target="_blank" style="color:#66b3ff; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                        <svg height="24" viewBox="0 0 24 24" width="24" aria-hidden="true" fill="#ffffff">
                          <path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z"></path>
                        </svg>
                        Contribute or Suggest more Hotkeys
                    </a>
                </div>
            `;
            document.body.appendChild(help);

            const closeHelp = (ev) => {
                if (ev.key === 'Escape' || ev.key === '?' || (ev.shiftKey && ev.key === '/')) {
                    help.remove();
                    document.removeEventListener('keydown', closeHelp);
                }
            };
            document.addEventListener('keydown', closeHelp);

            setTimeout(() => {
                help.remove();
                document.removeEventListener('keydown', closeHelp);
            }, 8000);
        }

        /* video page hotkeys */

        if (!isVideoPage()) return;
        const k = e.key.toLowerCase();

        if (k === 'a') {
            e.preventDefault(); e.stopPropagation();
            return openSettings(cycleAspect);
        }

        if (k === 'i') {
            e.preventDefault(); e.stopPropagation();
            openSettings(() => {
                document.querySelector('.actionSheetContent button[data-id="stats"]')?.click();
            });
        }

        if (k === 's') {
            e.preventDefault(); e.stopPropagation();
                document.querySelector('button.btnSubtitles')?.click();
        }
    });

    /* ------------ auto-pause/resume on tab visibility ------------ */
    document.addEventListener('visibilitychange', () => {
        const v = document.querySelector('video');
        if (!v) return;
        if (document.hidden && !v.paused) v.pause();
        else if (!document.hidden && v.paused) v.play();
    });
})();
