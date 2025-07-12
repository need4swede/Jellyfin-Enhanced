// ==UserScript==
// @name         Jellyfin Enhanced
// @namespace    https://github.com/n00bcodr/Jellyfin-Enhanced
// @version      2.0.0
// @description  Enhanced userscript for Jellyfin with comprehensive hotkey support, subtitle customization, auto-pause functionality, and update checking
// @author       n00bcodr
// @match        */web/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/n00bcodr/Jellyfin-Enhanced/main/jf_enhanced.js
// @downloadURL  https://raw.githubusercontent.com/n00bcodr/Jellyfin-Enhanced/main/jf_enhanced.js
// @supportURL   https://github.com/n00bcodr/Jellyfin-Enhanced/issues
// @homepageURL  https://github.com/n00bcodr/Jellyfin-Enhanced
// ==/UserScript==

(function () {
    'use strict';

    // Script version
    const SCRIPT_VERSION = '2.0.0';
    const GITHUB_REPO = 'n00bcodr/Jellyfin-Enhanced';
    const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

    /* ------------ Update System ------------ */
    let updateAvailable = false;
    let latestVersion = null;
    let latestReleaseData = null;

    const checkForUpdates = async (showToast = false) => {
        try {
            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
            if (!response.ok) throw new Error('Failed to fetch release data');

            const release = await response.json();
            const latestVersionFromGitHub = release.tag_name.replace(/^v/, '');

            latestVersion = latestVersionFromGitHub;
            latestReleaseData = release;

            const isNewer = compareVersions(latestVersionFromGitHub, SCRIPT_VERSION) > 0;
            updateAvailable = isNewer;

            if (isNewer) {
                showUpdateNotification(release);
            } else if (showToast) {
                toast('✅ You have the latest version!', 2000);
            }

            // Update last check time
            localStorage.setItem('jellyfinEnhancedLastUpdateCheck', Date.now().toString());

        } catch (error) {
            console.error('Update check failed:', error);
            if (showToast) {
                toast('❌ Update check failed', 2000);
            }
        }
    };

    const compareVersions = (a, b) => {
        const parseVersion = (v) => v.split('.').map(n => parseInt(n, 10));
        const [aMajor, aMinor, aPatch] = parseVersion(a);
        const [bMajor, bMinor, bPatch] = parseVersion(b);

        if (aMajor !== bMajor) return aMajor - bMajor;
        if (aMinor !== bMinor) return aMinor - bMinor;
        return aPatch - bPatch;
    };

    const showUpdateNotification = (release) => {
        const notificationId = 'jellyfin-update-notification';
        const existing = document.getElementById(notificationId);
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.id = notificationId;
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,20,0.95))',
            color: '#fff',
            padding: '20px',
            borderRadius: '12px',
            zIndex: 999999,
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '400px',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-out'
        });

        const releaseNotes = release.body ?
            (release.body.length > 200 ? release.body.substring(0, 200) + '...' : release.body) :
            'No release notes available.';
        // Panel for Update Notification
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="
                    width: 40px;
                    height: 40px;
                    background: #4ade80;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                ">🔄</div>
                <div>
                    <div style="font-weight: 600; font-size: 16px; color: #4ade80;">Update Available!</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.7);">v${SCRIPT_VERSION} → v${release.tag_name.replace(/^v/, '')}</div>
                </div>
            </div>
            <div style="margin-bottom: 16px; font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.4;">
                <strong>What's New:</strong><br><br>
                ${releaseNotes}
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <a href="https://raw.githubusercontent.com/${GITHUB_REPO}/main/jf_enhanced.js" target="_blank" style="
                    background: #1a5f1a;
                    border: 1px solid #4ade80;
                    color: white;
                    text-decoration: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    ">
                    📄 View Latest
                </a>
                <a href="https://github.com/${GITHUB_REPO}/releases/latest" target="_blank" style="
                    background: #3e74f2bd;
                    border: 1px solid #779aeadc;
                    color: white;
                    text-decoration: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    ">
                    📋 Release Notes
                </a>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #f25151b5;
                    border: 1px solid #f2515133;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    " >
                    ✕ Later
                </button>
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.6);">
                Please update through your userscript manager or installation method.
            </div>
        `;

        document.body.appendChild(notification);

        // Slide in
        setTimeout(() => notification.style.transform = 'translateX(0)', 10);

        // Auto-dismiss after 15 seconds
        setTimeout(() => {
            if (document.getElementById(notificationId)) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 15000);
    };

    // Auto-check for updates on load
    const lastCheck = localStorage.getItem('jellyfinEnhancedLastUpdateCheck');
    if (!lastCheck || Date.now() - parseInt(lastCheck) > UPDATE_CHECK_INTERVAL) {
        setTimeout(() => checkForUpdates(), 2000);
    }

    /* ------------ Hide the settings button on desktop ------------ */
    const injectCustomStyles = () => {
        const styleId = 'jellyfin-enhanced-styles';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
             .layout-desktop #enhancedSettingsBtn {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    };

    // Inject the custom CSS rules when the script loads.
    injectCustomStyles();


    /* ------------ helpers ------------ */
    const isVideoPage = () => location.hash.startsWith('#/video');
    const settingsBtn = () => document.querySelector('button[title="Settings"],button[aria-label="Settings"]');

    const openSettings = (cb) => {
        settingsBtn()?.click();
        setTimeout(cb, 120);
    };

    const toast = (txt, duration = 1400) => {
        const t = document.createElement('div');
        Object.assign(t.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            transform: 'translateX(100%)',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(40,40,40,0.9))',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
            zIndex: 99999,
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'transform 0.3s ease-out',
            maxWidth: '300px'
        });
        t.textContent = txt;
        document.body.appendChild(t);

        // Slide in
        setTimeout(() => t.style.transform = 'translateX(0)', 10);

        // Slide out and remove
        setTimeout(() => {
            t.style.transform = 'translateX(100%)';
            setTimeout(() => t.remove(), 300);
        }, duration);
    };

    /* ------------ Enhanced Subtitle Style Presets ------------ */
    const subtitlePresets = [
        { name: "Clean White", textColor: "#FFFFFFFF", bgColor: "transparent", previewText: "Aa" },
        { name: "Classic Black Box", textColor: "#FFFFFFFF", bgColor: "#000000FF", previewText: "Aa" },
        { name: "Netflix Style", textColor: "#FFFFFFFF", bgColor: "#000000B2", previewText: "Aa" },
        { name: "Cinema Yellow", textColor: "#FFFF00FF", bgColor: "#000000B2", previewText: "Aa" },
        { name: "Soft Gray", textColor: "#FFFFFFFF", bgColor: "#444444B2", previewText: "Aa" },
        { name: "High Contrast", textColor: "#000000FF", bgColor: "#FFFFFFFF", previewText: "Aa" }
    ];

    /* ------------ Enhanced Font Size Presets ------------ */
    const fontSizePresets = [
        { name: "Tiny", size: 0.6, previewText: "Aa" },
        { name: "Small", size: 0.8, previewText: "Aa" },
        { name: "Normal", size: 1.0, previewText: "Aa" },
        { name: "Large", size: 1.3, previewText: "Aa" },
        { name: "Extra Large", size: 1.6, previewText: "Aa" }
    ];

    /* ------------ Font Family Presets ------------ */
    const fontFamilyPresets = [
        { name: "Default", family: "inherit", previewText: "AaBb" },
        { name: "Noto Sans", family: "Noto Sans,sans-serif", previewText: "AaBb" },
        { name: "Sans Serif", family: "Arial,Helvetica,sans-serif", previewText: "AaBb" },
        { name: "Typewriter", family: "Courier New,Courier,monospace", previewText: "AaBb" },
        { name: "Roboto", family: "Roboto Mono,monospace", previewText: "AaBb" }
    ];

    /* ------------ Enhanced subtitle styling ------------ */
    const applySubtitleStyles = (textColor, bgColor, fontSize, fontFamily) => {
        let styleElement = document.getElementById('htmlvideoplayer-cuestyle');
        let isFallback = false;

        // Find the primary style element or create a fallback
        if (!styleElement) {
            styleElement = document.getElementById('jellyfin-enhanced-subtitle-styles');
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = 'jellyfin-enhanced-subtitle-styles';
                document.head.appendChild(styleElement);
            }
            isFallback = true;
        }

        const sheet = styleElement.sheet;
        if (!sheet) return;

        const selectors = isFallback
            ? ['.htmlvideoplayer::cue', 'video::cue', '::cue', 'video > track::cue']
            : ['.htmlvideoplayer::cue'];

        let ruleFound = false;

        // Iterate through existing rules and modify them
        for (const rule of sheet.cssRules) {
            if (selectors.includes(rule.selectorText)) {
                rule.style.setProperty('background-color', bgColor, 'important');
                rule.style.setProperty('color', textColor, 'important');
                rule.style.setProperty('font-size', `${fontSize}em`, 'important');
                rule.style.setProperty('font-family', fontFamily, 'important');
                ruleFound = true;
            }
        }

        // If no rule was found, insert a new one
        if (!ruleFound) {
            const newRule = `
                ${selectors.join(', ')} {
                    background-color: ${bgColor} !important;
                    color: ${textColor} !important;
                    font-size: ${fontSize}em !important;
                    font-family: ${fontFamily} !important;
                }
            `;
            try {
                sheet.insertRule(newRule, sheet.cssRules.length);
            } catch (e) {
                console.error("Failed to insert CSS rule:", e);
            }
        }
    };

    /* ------------ Settings persistence ------------ */
    const saveSettings = (settings) => {
        try {
            localStorage.setItem('jellyfinEnhancedSettings', JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    };

    const loadSettings = () => {
        try {
            const settings = JSON.parse(localStorage.getItem('jellyfinEnhancedSettings'));
            return settings || {
                autoPauseEnabled: true,
                autoResumeEnabled: false,
                selectedStylePresetIndex: 0,
                selectedFontSizePresetIndex: 2,
                selectedFontFamilyPresetIndex: 0
            };
        } catch (e) {
            console.error('Error loading settings:', e);
            return {
                autoPauseEnabled: true,
                autoResumeEnabled: false,
                selectedStylePresetIndex: 0,
                selectedFontSizePresetIndex: 2,
                selectedFontFamilyPresetIndex: 0
            };
        }
    };

    let currentSettings = loadSettings();

    /* ------------ Apply saved styles ------------ */
    const applySavedStylesWhenReady = () => {
        const savedStyleIndex = currentSettings.selectedStylePresetIndex ?? 0;
        const savedFontSizeIndex = currentSettings.selectedFontSizePresetIndex ?? 2;
        const savedFontFamilyIndex = currentSettings.selectedFontFamilyPresetIndex ?? 0;

        const stylePreset = subtitlePresets[savedStyleIndex];
        const fontSizePreset = fontSizePresets[savedFontSizeIndex];
        const fontFamilyPreset = fontFamilyPresets[savedFontFamilyIndex];

        if (stylePreset && fontSizePreset && fontFamilyPreset) {
            applySubtitleStyles(
                stylePreset.textColor,
                stylePreset.bgColor,
                fontSizePreset.size,
                fontFamilyPreset.family
            );
        }
    };
   /* ------------ Add OSD Button for Mobile ------------ */
    const addOsdSettingsButton = () => {
        if (document.getElementById('enhancedSettingsBtn')) return;

        const controlsContainer = document.querySelector('.videoOsdBottom .buttons.focuscontainer-x');
        if (!controlsContainer) return;

        const nativeSettingsButton = controlsContainer.querySelector('.btnVideoOsdSettings');
        if (!nativeSettingsButton) return;

        const enhancedSettingsBtn = document.createElement('button');
        enhancedSettingsBtn.id = 'enhancedSettingsBtn';
        enhancedSettingsBtn.setAttribute('is', 'paper-icon-button-light');
        enhancedSettingsBtn.className = 'autoSize paper-icon-button-light';
        enhancedSettingsBtn.title = 'Jellyfin Enhanced';
        enhancedSettingsBtn.innerHTML = '<span class="largePaperIconButton material-icons" aria-hidden="true">tune</span>';

        enhancedSettingsBtn.onclick = (e) => {
            e.stopPropagation();
            showHotkeyHelp();
        };

        nativeSettingsButton.parentElement.insertBefore(enhancedSettingsBtn, nativeSettingsButton);
    };
    /* ------------ Enhanced observers ------------ */
    const setupStyleObserver = () => {
        let isApplyingStyles = false;

        const observer = new MutationObserver(() => {
            // Prevent recursive style applications
            if (!isApplyingStyles) {
                isApplyingStyles = true;
                setTimeout(() => {
                    applySavedStylesWhenReady();
                    isApplyingStyles = false;
                }, 100);
            }

        // Add OSD button if it's not present
            if (isVideoPage()) {
                addOsdSettingsButton();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false  // Disable attribute observation to reduce excessive triggers
        });

        // Also reapply on fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            setTimeout(() => {
                if (!isApplyingStyles) {
                    applySavedStylesWhenReady();
                }
            }, 200);
        });
    };

    // Initialize observers
    setupStyleObserver();
    applySavedStylesWhenReady();

    /* ------------ Video control functions ------------ */
    const getVideo = () => document.querySelector('video');

    const cycleSubtitleTrack = () => {
        const video = getVideo();
        if (!video) return;

        const tracks = [...video.textTracks];
        if (tracks.length === 0) {
            toast('❌ No subtitle tracks');
            return;
        }

        const currentIndex = tracks.findIndex(track => track.mode === 'showing');
        const nextIndex = (currentIndex + 1) % (tracks.length + 1);

        // Turn off all tracks
        tracks.forEach(track => track.mode = 'disabled');

        if (nextIndex < tracks.length) {
            tracks[nextIndex].mode = 'showing';
            toast(`📝 Subtitle: ${tracks[nextIndex].label || `Track ${nextIndex + 1}`}`);
        } else {
            toast('📝 Subtitles: Off');
        }
    };

    const cycleAudioTrack = () => {
        const video = getVideo();
        if (!video) return;

        const tracks = [...video.audioTracks || []];
        if (tracks.length <= 1) {
            toast('❌ No additional audio tracks');
            return;
        }

        const currentIndex = tracks.findIndex(track => track.enabled);
        const nextIndex = (currentIndex + 1) % tracks.length;

        tracks.forEach((track, index) => {
            track.enabled = index === nextIndex;
        });

        toast(`🎵 Audio: ${tracks[nextIndex].label || `Track ${nextIndex + 1}`}`);
    };

    /* ------------ Aspect Ratio Cycle ------------ */
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

        const current = opts.findIndex(b => b.querySelector('.check')?.style.visibility !== 'hidden');
        const next = opts[(current + 1) % opts.length];
        next?.click();
        toast(`📐 ${next?.textContent.trim()}`);
    };

    /* ------------ Enhanced Help Panel ------------ */
    const showHotkeyHelp = () => {
        const panelId = 'hotkeyHelpOverlay';
        const existing = document.getElementById(panelId);
        if (existing) {
            existing.remove();
            return;
        }

        const help = document.createElement('div');
        help.id = panelId;
        Object.assign(help.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,20,0.95))',
            color: '#fff',
            padding: '0',
            borderRadius: '16px',
            zIndex: 999999,
            fontSize: '14px',
            backdropFilter: 'blur(20px)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: '600px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            cursor: 'grab'
        });

        // Draggable functionality
        let isDragging = false;
        let offset = { x: 0, y: 0 };

        const handleMouseDown = (e) => {
            if (e.target.closest('.preset-box') || e.target.closest('button') || e.target.closest('a') || e.target.closest('details') || e.target.closest('input')) return;
            isDragging = true;
            offset = {
                x: e.clientX - help.getBoundingClientRect().left,
                y: e.clientY - help.getBoundingClientRect().top
            };
            help.style.cursor = 'grabbing';
            e.preventDefault();
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            help.style.left = `${e.clientX - offset.x}px`;
            help.style.top = `${e.clientY - offset.y}px`;
            help.style.transform = 'none';
        };

        const handleMouseUp = () => {
            isDragging = false;
            help.style.cursor = 'grab';
        };

        help.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Prevent scrolling on the help panel from affecting the page
        help.addEventListener('wheel', (e) => {
            e.stopPropagation();
        });

        // Generate preset HTML with proper previews
        const generatePresetHTML = (presets, type) => {
            return presets.map((preset, index) => {
                let previewStyle = '';
                if (type === 'style') {
                    previewStyle = `
                        background-color: ${preset.bgColor};
                        color: ${preset.textColor};
                        border: 1px solid rgba(255,255,255,0.3);
                        text-shadow: #000000 0px 0px 3px;
                    `;
                } else if (type === 'font-size') {
                    previewStyle = `
                        font-size: ${preset.size * 1.2}em;
                        color: #fff;
                        text-shadow: 0 0 4px rgba(0,0,0,0.8);
                    `;
                } else if (type === 'font-family') {
                    previewStyle = `
                        font-family: ${preset.family};
                        color: #fff;
                        text-shadow: 0 0 4px rgba(0,0,0,0.8);
                        font-size: 1.5em;
                    `;
                }

                return `
                    <div class="preset-box ${type}-preset" data-preset-index="${index}" title="${preset.name}" style="
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 8px;
                        border: 2px solid transparent;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s;
                        background: rgba(255,255,255,0.05);
                        min-height: 50px;
                    " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                        <span style="
                            display: inline-block;
                            ${type === 'style' ? `
                                width: 40px;
                                height: 25px;
                                border-radius: 4px;
                                line-height: 25px;
                            ` : ''}
                            ${previewStyle}
                            text-align: center;
                            font-weight: bold;
                        ">${preset.previewText}</span>
                    </div>
                `;
            }).join('');
        };

        help.innerHTML = `
            <div style="padding: 18px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px; text-align: center; background: linear-gradient(135deg, #66b3ff, #4a9eff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    🪼 Jellyfin Enhanced
                </div>
                <div style="text-align: center; font-size: 12px; color: rgba(255,255,255,0.6);">
                    Version ${SCRIPT_VERSION}
                </div>
            </div>
            <div style="display: flex; flex-direction: column; height: calc(90vh - 150px);">
                <div style="
                    padding: 20px 20px;
                    flex: 1;
                    overflow-y: auto;
                    background: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.05) 95%, rgba(255,255,255,0.1) 100%);
                    position: relative;
                ">
                    <!-- Scroll indicator -->
                    <div style="
                        position: absolute;
                        top: 0;
                        right: 8px;
                        width: 4px;
                        height: 100%;
                        background: linear-gradient(to bottom, transparent, rgba(102, 179, 255, 0.3), transparent);
                        border-radius: 2px;
                        pointer-events: none;
                    "></div>
                <div style="margin-bottom: 24px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #66b3ff;">Global</h3>
                    <div style="display: grid; gap: 8px; font-size: 14px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">/</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Open search</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">Shift + Esc</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Go to home</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">D</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Go to dashboard</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">Q</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Quick Connect</span>
                        </div>
                </div>

                <div style="margin-top: 12px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #66b3ff;">Video Player</h3>
                    <div style="display: grid; gap: 8px; font-size: 14px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">A</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Cycle aspect ratio</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">I</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Show playback info</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">S</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Subtitle menu</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">C</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Cycle subtitle tracks</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">V</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Cycle audio tracks</span>
                        </div>
                    </div>
                </div>

                <details style="margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(0,0,0,0.2);">
                    <summary style="padding: 16px; font-weight: 600; color: #66b3ff; cursor: pointer; user-select: none;">
                        ⏯️ Auto-Pause Settings
                    </summary>
                    <div style="padding: 0 16px 16px 16px;">
                        <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 3px solid #66b3ff;">
                            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                                <input type="checkbox" id="autoPauseToggle" ${currentSettings.autoPauseEnabled ? 'checked' : ''} style="
                                    width: 18px;
                                    height: 18px;
                                    accent-color: #66b3ff;
                                    cursor: pointer;
                                ">
                                <div>
                                    <div style="font-size: 14px; font-weight: 500; color: #fff;">Auto-pause</div>
                                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 2px;">Automatically pause video when switching tabs</div>
                                </div>
                            </label>
                        </div>
                        <div style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 3px solid #a84ade;">
                            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                                <input type="checkbox" id="autoResumeToggle" ${currentSettings.autoResumeEnabled ? 'checked' : ''} style="
                                    width: 18px;
                                    height: 18px;
                                    accent-color: #a84ade;
                                    cursor: pointer;
                                ">
                                <div>
                                    <div style="font-size: 14px; font-weight: 500; color: #fff;">Auto-resume</div>
                                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 2px;">Automatically resume video when returning to tab</div>
                                </div>
                            </label>
                        </div>
                    </div>
                </details>

                <details style="margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(0,0,0,0.2);">
                    <summary style="padding: 16px; font-weight: 600; color: #66b3ff; cursor: pointer; user-select: none;">
                        📝 Subtitle Settings
                    </summary>
                    <div style="padding: 0 16px 16px 16px;">
                        <div style="margin-bottom: 16px;">
                            <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">Style</div>
                            <div id="subtitle-style-presets-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px;">
                                ${generatePresetHTML(subtitlePresets, 'style')}
                            </div>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">Size</div>
                            <div id="font-size-presets-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px;">
                                ${generatePresetHTML(fontSizePresets, 'font-size')}
                            </div>
                        </div>

                        <div>
                            <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">Font</div>
                            <div id="font-family-presets-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px;">
                                ${generatePresetHTML(fontFamilyPresets, 'font-family')}
                            </div>
                        </div>
                    </div>
                </details>

                </div>

            </div>

            <div style="padding: 24px; border-top: 1px solid rgba(255,255,255,0.1); background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,20,0.95)); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                    <div style="font-size: 12px; color: rgba(255,255,255,0.5);">
                        Press <kbd style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 3px;">?</kbd> or <kbd style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 3px;">Esc</kbd> to close
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <button id="checkUpdatesBtn" style="
                            background: ${updateAvailable ? 'linear-gradient(135deg, #1a5f1a, #2d8f2d)' : 'linear-gradient(135deg, #1e40af, #3b82f6)'};
                            color: white;
                            border: 1px solid ${updateAvailable ? '#4ade80' : '#60a5fa'};
                            padding: 4px 8px;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.2s;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        " onmouseover="this.style.background='${updateAvailable ? 'linear-gradient(135deg, #2d8f2d, #4ade80)' : 'linear-gradient(135deg, #3b82f6, #60a5fa)'}'"
                           onmouseout="this.style.background='${updateAvailable ? 'linear-gradient(135deg, #1a5f1a, #2d8f2d)' : 'linear-gradient(135deg, #1e40af, #3b82f6)'}'">
                            ${updateAvailable ? '📦 Update Available' : '🔄️ Check Updates'}
                        </button>
                        <a href="https://github.com/n00bcodr/Jellyfin-Enhanced" target="_blank" style="
                            color: #66b3ff;
                            text-decoration: none;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            font-size: 12px;
                            padding: 4px 8px;
                            border-radius: 4px;
                            background: rgba(102, 179, 255, 0.1);
                            transition: background 0.2s;
                        " onmouseover="this.style.background='rgba(102, 179, 255, 0.2)'" onmouseout="this.style.background='rgba(102, 179, 255, 0.1)'">
                            <svg height="12" viewBox="0 0 24 24" width="12" fill="currentColor">
                                <path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z"></path>
                            </svg>
                            Contribute
                        </a>
                    </div>
            </div>

            <button id="closeSettingsPanel" style="
                position: absolute;
                top: 24px;
                right: 24px;
                background: rgba(255,255,255,0.1);
                border: none;
                color: #fff;
                font-size: 16px;
                cursor: pointer;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">&times;</button>
        `;

        document.body.appendChild(help);

        // Auto-close after 10 seconds
        const autoCloseTimer = setTimeout(() => {
            if (document.getElementById(panelId)) {
                help.remove();
                document.removeEventListener('keydown', closeHelp);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.addEventListener('keydown', hotkeyListener);
            }
        }, 10000);

        // Setup auto-pause settings handlers
        const autoPauseToggle = document.getElementById('autoPauseToggle');
        const autoResumeToggle = document.getElementById('autoResumeToggle');

        autoPauseToggle.addEventListener('change', (e) => {
            currentSettings.autoPauseEnabled = e.target.checked;
            saveSettings(currentSettings);
            toast(`Auto-pause ${e.target.checked ? 'enabled' : 'disabled'}`);
        });

        autoResumeToggle.addEventListener('change', (e) => {
            currentSettings.autoResumeEnabled = e.target.checked;
            saveSettings(currentSettings);
            toast(`Auto-resume ${e.target.checked ? 'enabled' : 'disabled'}`);
        });

        // Setup check updates button
        const checkUpdatesBtn = document.getElementById('checkUpdatesBtn');
        checkUpdatesBtn.addEventListener('click', () => {
            if (updateAvailable && latestReleaseData) {
                showUpdateNotification(latestReleaseData);
            } else {
                checkForUpdates(true);
            }
        });

        // Auto-scroll to any section when opened
        const allDetails = help.querySelectorAll('details');
        allDetails.forEach((details, index) => {
            details.addEventListener('toggle', () => {
                if (details.open) {
                    setTimeout(() => {
                        details.scrollIntoView({ behavior: 'smooth', block: index === 0 ? 'center' : 'nearest' });
                    }, 150);
                }
            });
        });

        // Close handlers
        const closeHelp = (ev) => {
            if ((ev.type === 'keydown' && (ev.key === 'Escape' || ev.key === '?' || (ev.shiftKey && ev.key === '/'))) ||
                (ev.type === 'click' && ev.target.id === 'closeSettingsPanel')) {
                clearTimeout(autoCloseTimer);
                help.remove();
                document.removeEventListener('keydown', closeHelp);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.addEventListener('keydown', hotkeyListener);
            }
        };

        document.addEventListener('keydown', closeHelp);
        document.getElementById('closeSettingsPanel').addEventListener('click', closeHelp);
        document.removeEventListener('keydown', hotkeyListener);

        // Setup preset handlers
        const setupPresetHandlers = (containerId, presets, type) => {
            const container = document.getElementById(containerId);
            if (!container) return;

            container.addEventListener('click', (e) => {
                const presetBox = e.target.closest(`.${type}-preset`);
                if (!presetBox) return;

                const presetIndex = parseInt(presetBox.dataset.presetIndex, 10);
                const selectedPreset = presets[presetIndex];

                if (selectedPreset) {
                    if (type === 'style') {
                        currentSettings.selectedStylePresetIndex = presetIndex;
                        const fontSizeIndex = currentSettings.selectedFontSizePresetIndex ?? 2;
                        const fontFamilyIndex = currentSettings.selectedFontFamilyPresetIndex ?? 0;
                        const fontSize = fontSizePresets[fontSizeIndex].size;
                        const fontFamily = fontFamilyPresets[fontFamilyIndex].family;
                        applySubtitleStyles(selectedPreset.textColor, selectedPreset.bgColor, fontSize, fontFamily);
                        toast(`🎨 ${selectedPreset.name} Applied`);
                    } else if (type === 'font-size') {
                        currentSettings.selectedFontSizePresetIndex = presetIndex;
                        const styleIndex = currentSettings.selectedStylePresetIndex ?? 0;
                        const fontFamilyIndex = currentSettings.selectedFontFamilyPresetIndex ?? 0;
                        const stylePreset = subtitlePresets[styleIndex];
                        const fontFamily = fontFamilyPresets[fontFamilyIndex].family;
                        applySubtitleStyles(stylePreset.textColor, stylePreset.bgColor, selectedPreset.size, fontFamily);
                        toast(`📏 ${selectedPreset.name} Size Applied`);
                    } else if (type === 'font-family') {
                        currentSettings.selectedFontFamilyPresetIndex = presetIndex;
                        const styleIndex = currentSettings.selectedStylePresetIndex ?? 0;
                        const fontSizeIndex = currentSettings.selectedFontSizePresetIndex ?? 2;
                        const stylePreset = subtitlePresets[styleIndex];
                        const fontSize = fontSizePresets[fontSizeIndex].size;
                        applySubtitleStyles(stylePreset.textColor, stylePreset.bgColor, fontSize, selectedPreset.family);
                        toast(`🔤 ${selectedPreset.name} Font Applied`);
                    }

                    saveSettings(currentSettings);

                    // Update visual selection
                    container.querySelectorAll('.preset-box').forEach(box => {
                        box.style.border = '2px solid transparent';
                    });
                    presetBox.style.border = '2px solid #66b3ff';
                }
            });

            // Highlight current selection
            let currentIndex;
            if (type === 'style') {
                currentIndex = currentSettings.selectedStylePresetIndex ?? 0;
            } else if (type === 'font-size') {
                currentIndex = currentSettings.selectedFontSizePresetIndex ?? 2;
            } else if (type === 'font-family') {
                currentIndex = currentSettings.selectedFontFamilyPresetIndex ?? 0;
            }

            const activeBox = container.querySelector(`[data-preset-index="${currentIndex}"]`);
            if (activeBox) {
                activeBox.style.border = '2px solid #66b3ff';
            }
        };

        setupPresetHandlers('subtitle-style-presets-container', subtitlePresets, 'style');
        setupPresetHandlers('font-size-presets-container', fontSizePresets, 'font-size');
        setupPresetHandlers('font-family-presets-container', fontFamilyPresets, 'font-family');
    };

    /* ------------ Enhanced hotkeys ------------ */
    const hotkeyListener = (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        // Global hotkeys
        if (e.key === '/' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            document.querySelector('button.headerSearchButton')?.click();
            setTimeout(() => document.querySelector('input[type="search"]')?.focus(), 100);
            toast('🔍 Search');
            return;
        }

        if (e.key === 'Escape' && e.shiftKey) {
            e.preventDefault();
            location.href = '/web/#/home.html';
            toast('🏠 Home');
            return;
        }

        if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            location.href = '/web/#/dashboard';
            toast('📊 Dashboard');
            return;
        }

        if (e.key.toLowerCase() === 'q' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            location.href = '/web/#/quickconnect';
            toast('🔗 Quick Connect');
            return;
        }

        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
            e.preventDefault();
            e.stopPropagation();
            showHotkeyHelp();
            return;
        }

        // Video page specific hotkeys
        if (!isVideoPage()) return;

        const k = e.key.toLowerCase();

        // Prevent default for video hotkeys
        const videoHotkeys = ['a', 'i', 's', 'c', 'v'];
        if (videoHotkeys.includes(k)) {
            e.preventDefault();
            e.stopPropagation();
        }

        switch (k) {
            case 'a':
                openSettings(cycleAspect);
                break;
            case 'i':
                openSettings(() => {
                    document.querySelector('.actionSheetContent button[data-id="stats"]')?.click();
                });
                break;
            case 's':
                // Check if subtitle menu is already open by looking for subtitle-specific content
                const existingSubtitleSheet = document.querySelector('.actionSheetContent h1.actionSheetTitle');
                if (existingSubtitleSheet && existingSubtitleSheet.textContent === 'Subtitles') {
                    // Subtitle menu is already open, don't open it again
                    return;
                }

                // Check if any other action sheet is open
                const existingActionSheet = document.querySelector('.actionSheetContent');
                if (existingActionSheet) {
                    // Close existing action sheet first
                    document.body.click();
                    setTimeout(() => {
                        document.querySelector('button.btnSubtitles')?.click();
                    }, 100);
                } else {
                    document.querySelector('button.btnSubtitles')?.click();
                }
                break;
            case 'c':
                cycleSubtitleTrack();
                break;
            case 'v':
                cycleAudioTrack();
                break;
        }
    };

    document.addEventListener('keydown', hotkeyListener);

    /* ------------ Enhanced auto-pause/resume with settings ------------ */
    document.addEventListener('visibilitychange', () => {
        const video = getVideo();
        if (!video) return;

        if (document.hidden && !video.paused && currentSettings.autoPauseEnabled) {
            video.pause();
            video.dataset.wasPlayingBeforeHidden = 'true';
        } else if (!document.hidden && video.paused && video.dataset.wasPlayingBeforeHidden === 'true' && currentSettings.autoResumeEnabled) {
            video.play();
            delete video.dataset.wasPlayingBeforeHidden;
        }
    });

    // Also show on hash change to video page
    window.addEventListener('hashchange', () => {
        setTimeout(() => {
            if (isVideoPage() && document.querySelector('video')) {
                // Page changed to video - no additional setup needed
            }
        }, 1000);
    });

})();