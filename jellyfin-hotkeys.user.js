// ==UserScript==
// @name         Jellyfin Shortcuts
// @namespace    http://tampermonkey.net/
// @version      1.4.0
// @description  ? = List Hotkeys, / = search,  A = aspect-ratio cycle,  I = playback info,  Shift+Esc = home, S = Subtitle Menu, also style subtitles.
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

    /* ------------ Subtitle Style Presets Definition (RGBA Hex) ------------ */
    const subtitlePresets = [
        {
            name: "White Text No Background",
            textColor: "#FFFFFFFF",
            bgColor: "none",
            previewText: "Aa"
        },
        {
            name: "White Text Black Background",
            textColor: "#FFFFFFFF",
            bgColor: "#000000FF",
            previewText: "Aa"
        },
        {
            name: "Yellow Text Black Background",
            textColor: "#FFFF00FF",
            bgColor: "#000000B2",
            previewText: "Aa"
        },
        {
            name: "White Text Gray Background",
            textColor: "#FFFFFFFF",
            bgColor: "#444444B2",
            previewText: "Aa"
        },
        {
            name: "Black Text White Background",
            textColor: "#000000FF",
            bgColor: "#FFFFFFFF",
            previewText: "Aa"
        }
    ];

    /* ------------ Font Size Presets Definition ------------ */
    const fontSizePresets = [
        {
            name: "Small",
            size: 0.7,
            previewText: "Aa"
        },
        {
            name: "Normal",
            size: 1.0,
            previewText: "Aa"
        },
        {
            name: "Large",
            size: 1.5,
            previewText: "Aa"
        }
    ];


    /* ------------ subtitle styling function ------------ */
    const applySubtitleStyles = (textColor, bgColor, fontSize) => {
        const styleElement = document.getElementById('htmlvideoplayer-cuestyle');

        if (styleElement) {
            const baseCueStyleProperties = [
                'font-weight:normal!important',
                'text-shadow:#000000 0px 0px 7px!important',
                'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol!important',
                'font-variant:none!important',
                'margin-bottom:2.7em!important'
            ];
            const baseCueStyle = baseCueStyleProperties.join(';');

            styleElement.textContent = `
                .htmlvideoplayer::cue {
                    ${baseCueStyle};
                    background-color: ${bgColor}!important;
                    color: ${textColor}!important;
                    font-size: ${fontSize}em!important;
                }
            `;
            console.log(`Successfully updated subtitle styles: text=${textColor}, background=${bgColor}, font-size=${fontSize}em`);
        } else {
            console.warn('Could not find #htmlvideoplayer-cuestyle element. Subtitle styles might not apply.');
            let newStyleElement = document.getElementById('jellyfin-subtitle-styles');
            if (!newStyleElement) {
                newStyleElement = document.createElement('style');
                newStyleElement.id = 'jellyfin-subtitle-styles';
                document.head.appendChild(newStyleElement);
            }
            newStyleElement.textContent = `
                video::cue, .htmlvideoplayer::cue, ::cue, video > track::cue {
                    color: ${textColor} !important;
                    background-color: ${bgColor} !important;
                    font-size: ${fontSize}em!important;
                }
            `;
            console.log(`Fallback: Injected new style tag for subtitle styles: text=${textColor}, background=${bgColor}, font-size=${fontSize}em`);
        }
    };

    /* ------------ Save/Load Settings ------------ */
    const saveSettings = (settings) => {
        localStorage.setItem('jellyfinCustomSettings', JSON.stringify(settings));
    };

    const loadSettings = () => {
        try {
            const settings = JSON.parse(localStorage.getItem('jellyfinCustomSettings'));
            return settings || {};
        } catch (e) {
            console.error('Error loading settings:', e);
            return {};
        }
    };

    let currentSettings = loadSettings(); // Load settings when script starts

    // Function to apply saved styles
    const applySavedStylesWhenReady = () => {
        // Default to the new "White Text No Background" preset (index 0)
        const savedStylePresetIndex = currentSettings.selectedStylePresetIndex !== undefined ? currentSettings.selectedStylePresetIndex : 0;
        // Default to "Normal" font size preset (index 1)
        const savedFontSizePresetIndex = currentSettings.selectedFontSizePresetIndex !== undefined ? currentSettings.selectedFontSizePresetIndex : 1;

        const stylePreset = subtitlePresets[savedStylePresetIndex];
        const fontSizePreset = fontSizePresets[savedFontSizePresetIndex];

        if (stylePreset && fontSizePreset) {
            applySubtitleStyles(
                stylePreset.textColor,
                stylePreset.bgColor,
                fontSizePreset.size
            );
        } else {
            console.warn('Saved preset index is invalid or preset not found, applying default presets.');
            // Fallback to the new "White Text No Background" and "Normal" font size
            applySubtitleStyles(
                subtitlePresets[0].textColor,
                subtitlePresets[0].bgColor,
                fontSizePresets[1].size
            );
        }
    };

    // Use a MutationObserver to watch for the #htmlvideoplayer-cuestyle element to appear
    const observer = new MutationObserver((mutationsList, observer) => {
        if (document.getElementById('htmlvideoplayer-cuestyle')) {
            applySavedStylesWhenReady();
            observer.disconnect(); // Disconnect once the element is found and styles applied
        }
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also try applying styles immediately in case the element is already there
    applySavedStylesWhenReady();


    /* ------------ Aspect Ratio Cycle Function ------------ */
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

    /* ------------ Hotkey Help / Settings Panel ------------ */
    const showHotkeyHelp = () => {
        const panelId = 'hotkeyHelpOverlay';
        if (document.getElementById(panelId)) {
             document.getElementById(panelId).remove();
             return;
        }

        const help = document.createElement('div');
        help.id = panelId;
        Object.assign(help.style, {
            position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '20px',
            borderRadius: '12px', zIndex: 9999, fontSize: '16px',
            backdropFilter: 'blur(15px)',
            maxWidth: '90%',
            width: '500px',
            lineHeight: '1.5',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            boxSizing: 'border-box',
            overflow: 'auto',
            cursor: 'grab',
            '--webkit-scrollbar-width': '0px',
            '--webkit-scrollbar-thumb-background': 'transparent',
            '--webkit-scrollbar-track-background': 'transparent',
        });

        help.style.cssText += `
            &::-webkit-scrollbar { width: 0px; height: 0px; }
            &::-webkit-scrollbar-thumb { background: transparent; }
            &::-webkit-scrollbar-track { background: transparent; }
        `;

        // Make draggable
        let isDragging = false;
        let offset = { x: 0, y: 0 };

        help.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.preset-box')) {
                return;
            }
            isDragging = true;
            offset = {
                x: e.clientX - help.getBoundingClientRect().left,
                y: e.clientY - help.getBoundingClientRect().top
            };
            help.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            help.style.left = `${e.clientX - offset.x}px`;
            help.style.top = `${e.clientY - offset.y}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            help.style.cursor = 'grab';
        });

        // Generate subtitle style presets HTML
        let stylePresetsHtml = '';
        subtitlePresets.forEach((preset, index) => {
            stylePresetsHtml += `
                <div class="preset-box style-preset" data-preset-index="${index}" title="${preset.name}" style="
                    display: flex; justify-content: center; align-items: center; padding: 0px;
                    border: 0px solid #666;
                    border-radius: 5px;
                    cursor: pointer; transition: background-color 0.2s;
                    background-color: rgba(0,0,0,0.3); height: 40px;
                ">
                    <span style="
                        display: inline-block; width: 40px; height: 25px; border: 1px solid #888; border-radius: 3px;
                        background-color: ${preset.bgColor}; color: ${preset.textColor};
                        font-size: 1.0em;
                        line-height: 25px; text-align: center; font-weight: bold;
                    ">${preset.previewText}</span>
                </div>
            `;
        });

        // Generate font size presets HTML
        let fontSizePresetsHtml = '';
        fontSizePresets.forEach((preset, index) => {
            fontSizePresetsHtml += `
                <div class="preset-box font-size-preset" data-preset-index="${index}" title="${preset.name} Font Size" style="
                    display: flex; justify-content: center; align-items: center; padding: 0px;
                    border: 0px solid #666;
                    border-radius: 5px;
                    cursor: pointer; transition: background-color 0.2s;
                    background-color: rgba(0,0,0,0.3); height: 40px;
                ">
                    <span style="
                        font-size: ${preset.size * 1.0}em;
                        line-height: 1;
                        color: #FFFFFFFF;
                        text-shadow: #000000 0px 0px 3px;
                    ">${preset.previewText}</span>
                </div>
            `;
        });


        help.innerHTML = `
            <div style="font-size: 1.5em; color: #fff; margin-bottom: 15px; text-align: center;">🪼 <b><u>Jellyfin Shortcuts</u></b></div>

            <table style="width: 100%; border-collapse: collapse; border: 10px solid black margin-bottom: 15px;">
                <tr><td style="padding-right: 15px;">/</td><td>Open Search Page</td></tr>
                <tr><td>A</td><td>Cycle aspect ratio</td></tr>
                <tr><td>I</td><td>Show/hide playback info</td></tr>
                <tr><td>S</td><td>Show subtitle menu</td></tr>
                <tr><td>Shift + Esc</td><td>Go to Home</td></tr>
            </table>

            <details style="margin-top: 10px; border: 1px solid #555; border-radius: 5px; padding: 10px; background: rgba(0, 0, 0, 0.2);">
                <summary style="font-weight: bold; color: #ddd; padding-bottom: 5px; font-size: 1.1em; cursor: pointer;">Subtitle Settings</summary>
                <div style="padding-top: 10px;">
                    <div style="font-weight: bold; color: #ddd; padding-bottom: 5px; text-align: center;">Subtitle Style</div>
                    <div id="subtitle-style-presets-container" style="
                        display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap: 10px; padding-bottom: 15px;
                    ">
                        ${stylePresetsHtml}
                    </div>
                    <div style="font-weight: bold; color: #ddd; padding-bottom: 5px; text-align: center; border-top: 1px solid #444; padding-top: 15px;">Font Size</div>
                    <div id="font-size-presets-container" style="
                        display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap: 10px;
                    ">
                        ${fontSizePresetsHtml}
                    </div>
                </div>
            </details>


            <div style="margin-top: 15px; font-size: 0.8em; color: #888; text-align: center;">
                Press <b>?</b> or <b>Esc</b> to close
            </div>
            <div style="margin-top: 15px; text-align: center; border-top: 1px solid #444; padding-top: 15px;">
                <a href="https://github.com/n00bcodr/Jellyfin-hotkeys" target="_blank" style="color:#66b3ff; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-size: 0.9em;">
                    <svg height="20" viewBox="0 0 24 24" width="20" aria-hidden="true" fill="#ffffff">
                        <path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z"></path>
                    </svg>
                    Contribute or Suggest
                </a>
            </div>
            <button id="closeSettingsPanel" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;">&times;</button>
        `;

        document.body.appendChild(help);

        // Define a function to close the help panel
        const closeHelp = (ev) => {
            if ((ev.type === 'keydown' && (ev.key === 'Escape' || ev.key === '?' || (ev.shiftKey && ev.key === '/'))) ||
                (ev.type === 'click' && ev.target.id === 'closeSettingsPanel')) {
                help.remove();
                document.removeEventListener('keydown', closeHelp);
                document.addEventListener('keydown', hotkeyListener); // Re-add main hotkey listener
            }
        };

        document.addEventListener('keydown', closeHelp);
        const closeBtn = document.getElementById('closeSettingsPanel');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeHelp);
        }

        document.removeEventListener('keydown', hotkeyListener);

        // Attach click listeners to subtitle style preset boxes
        const stylePresetContainer = document.getElementById('subtitle-style-presets-container');
        if (stylePresetContainer) {
            stylePresetContainer.addEventListener('click', (e) => {
                const presetBox = e.target.closest('.style-preset');
                if (presetBox) {
                    const presetIndex = parseInt(presetBox.dataset.presetIndex, 10);
                    const selectedStylePreset = subtitlePresets[presetIndex];

                    if (selectedStylePreset) {
                        currentSettings.selectedStylePresetIndex = presetIndex; // Save selected index
                        saveSettings(currentSettings);
                        // Apply with current font size
                        const currentFontSizePresetIndex = currentSettings.selectedFontSizePresetIndex !== undefined ? currentSettings.selectedFontSizePresetIndex : 1;
                        const currentFontSize = fontSizePresets[currentFontSizePresetIndex].size;

                        applySubtitleStyles(
                            selectedStylePreset.textColor,
                            selectedStylePreset.bgColor,
                            currentFontSize
                        );
                        toast(`Style applied!`);
                        document.querySelectorAll('.style-preset').forEach(box => {
                            box.style.border = '0px solid #666'; // Reset to no border
                        });
                        presetBox.style.border = '2px solid #66b3ff'; // Highlight
                    }
                }
            });

            // Highlight the currently active style preset when the panel opens
            const savedStylePresetIndex = currentSettings.selectedStylePresetIndex !== undefined ? currentSettings.selectedStylePresetIndex : 0; // Default to 0 (White Text No Background)
            const activeStylePresetBox = stylePresetContainer.querySelector(`[data-preset-index="${savedStylePresetIndex}"]`);
            if (activeStylePresetBox) {
                activeStylePresetBox.style.border = '2px solid #66b3ff';
            }
        }

        // Attach click listeners to font size preset boxes
        const fontSizePresetContainer = document.getElementById('font-size-presets-container');
        if (fontSizePresetContainer) {
            fontSizePresetContainer.addEventListener('click', (e) => {
                const presetBox = e.target.closest('.font-size-preset');
                if (presetBox) {
                    const presetIndex = parseInt(presetBox.dataset.presetIndex, 10);
                    const selectedFontSizePreset = fontSizePresets[presetIndex];

                    if (selectedFontSizePreset) {
                        currentSettings.selectedFontSizePresetIndex = presetIndex; // Save selected index
                        saveSettings(currentSettings);
                        // Apply with current style colors
                        const currentStylePresetIndex = currentSettings.selectedStylePresetIndex !== undefined ? currentSettings.selectedStylePresetIndex : 0;
                        const currentStylePreset = subtitlePresets[currentStylePresetIndex];

                        applySubtitleStyles(
                            currentStylePreset.textColor,
                            currentStylePreset.bgColor,
                            selectedFontSizePreset.size
                        );
                        toast(`Style applied!`);
                        document.querySelectorAll('.font-size-preset').forEach(box => {
                            box.style.border = '0px solid #666'; // Reset to no border
                        });
                        presetBox.style.border = '2px solid #66b3ff'; // Highlight
                    }
                }
            });

            // Highlight the currently active font size preset when the panel opens
            const savedFontSizePresetIndex = currentSettings.selectedFontSizePresetIndex !== undefined ? currentSettings.selectedFontSizePresetIndex : 1; // Default to Normal
            const activeFontSizePresetBox = fontSizePresetContainer.querySelector(`[data-preset-index="${savedFontSizePresetIndex}"]`);
            if (activeFontSizePresetBox) {
                activeFontSizePresetBox.style.border = '2px solid #66b3ff';
            }
        }
    };


    /* ------------ hotkeys ------------ */
    const hotkeyListener = (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        if (e.key === '/' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            document.querySelector('button.headerSearchButton')?.click();
            return setTimeout(() => document.querySelector('input[type="search"]')?.focus(), 100);
        }
        if (e.key === 'Escape' && e.shiftKey) {
            e.preventDefault();
            return (location.href = '/web/#/home.html');
        }

        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
            e.preventDefault(); e.stopPropagation();
            showHotkeyHelp();
            return;
        }

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
    };

    document.addEventListener('keydown', hotkeyListener);


    /* ------------ auto-pause/resume on tab visibility ------------ */
    document.addEventListener('visibilitychange', () => {
        const v = document.querySelector('video');
        if (!v) return;
        if (document.hidden && !v.paused) v.pause();
        else if (!document.hidden && v.paused) v.play();
    });

})();