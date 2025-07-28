// ==UserScript==
// @name         Jellyfin Enhanced
// @namespace    https://github.com/n00bcodr/Jellyfin-Enhanced
// @version      4.0
// @description  Userscript for Jellyfin with comprehensive shortcut support, subtitle customization, auto-pause functionality, random item selection, and update checking
// @author       n00bcodr
// @match        */web/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/n00bcodr/Jellyfin-Enhanced/main/jf_enhanced.js
// @downloadURL  https://raw.githubusercontent.com/n00bcodr/Jellyfin-Enhanced/main/jf_enhanced.js
// @supportURL   https://github.com/n00bcodr/Jellyfin-Enhanced/issues
// @homepageURL  https://github.com/n00bcodr/Jellyfin-Enhanced
// ==/UserScript==
/* global ApiClient */

(function() {
    'use strict';

    // --- Configuration ---
    const CONFIG = { // all timeouts in milliseconds
        UPDATE_CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
        CLEAR_BOOKMARKS_DELAY: 3000, // 3 seconds
        TOAST_DURATION: 1500, // milliseconds
        HELP_PANEL_AUTOCLOSE_DELAY: 15000, // 15 seconds
    };

    // --- Global variables ---
    let shiftBTimer = null; // Timer for the 'Shift+B' (clear all bookmarks) Shortcut
    let shiftBTriggered = false; // Flag to prevent multiple triggers of the clear bookmarks action

    // --- Script metadata ---
    const SCRIPT_VERSION = '4.0';
    const GITHUB_REPO = 'n00bcodr/Jellyfin-Enhanced';

    /*
     * --------------------------------------------------------------------------------
     * UPDATE SYSTEM
     * - Checks GitHub for new script versions and displays a notification.
     * --------------------------------------------------------------------------------
     */
    let updateAvailable = false;
    let latestVersion = null;
    let latestReleaseData = null;

    // Fetches the latest release information from the GitHub repository.
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
                toast('✅ You have the latest and greatest!', 2000);
            }
            // Store the timestamp of the last check.
            localStorage.setItem('jellyfinEnhancedLastUpdateCheck', Date.now().toString());
        } catch (error) {
            console.error('Update check failed:', error);
            if (showToast) {
                toast('❌ Update Check Failed!', 2000);
            }
        }
    };

    // Compares two version strings (e.g., "1.2.3" vs "1.2.4").
    const compareVersions = (a, b) => {
        const parseVersion = (v) => v.split('.').map(n => parseInt(n, 10));
        const [aMajor, aMinor, aPatch] = parseVersion(a);
        const [bMajor, bMinor, bPatch] = parseVersion(b);

        if (aMajor !== bMajor) return aMajor - bMajor;
        if (aMinor !== bMinor) return aMinor - bMinor;
        return aPatch - bPatch;
    };

    // Displays a dismissible notification panel when an update is available.
    const showUpdateNotification = (release) => {
        const notificationId = 'jellyfin-update-notification';
        const existing = document.getElementById(notificationId);
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.id = notificationId;

        const getJellyfinThemeVariable = (variableName, defaultValue) => {
            const rootStyle = getComputedStyle(document.documentElement);
            const value = rootStyle.getPropertyValue(variableName).trim();
            return value || defaultValue;
        };

        const isJellyfishThemeActive = getJellyfinThemeVariable('--theme-updated-on', '') !== '' || getJellyfinThemeVariable('--theme-name', '').toLowerCase().includes('jellyfish');

        let panelBg, panelBorder, panelBlur, textColor;

        if (isJellyfishThemeActive) {
            panelBg = getJellyfinThemeVariable('--primary-background-transparent', 'rgba(0,0,0,0.95)');
            panelBorder = `1px solid ${getJellyfinThemeVariable('--primary-accent-color', 'rgba(255,255,255,0.1)')}`;
            textColor = getJellyfinThemeVariable('--text-color', '#fff');
            panelBlur = getJellyfinThemeVariable('--blur', '20px');
        } else {
            // Fallback to original styles if theme is not active
            panelBg = 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,20,0.95))';
            panelBorder = '1px solid rgba(255,255,255,0.1)';
            textColor = '#fff';
            panelBlur = '20px';
        }

        // Styles for the notification panel
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: panelBg,
            color: textColor,
            padding: '20px',
            borderRadius: '12px',
            zIndex: 999999,
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: `blur(${panelBlur})`,
            border: panelBorder,
            maxWidth: '400px',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-out',
            fontFamily: 'inherit'
        });

        const releaseNotes = release.body ?
            (release.body.length > 500 ? release.body.substring(0, 200) + '...' : release.body) :
            'No release notes available.';

        // HTML content for the notification
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="width: 40px; height: 40px; background: #4ade80; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;">🔄</div>
                <div>
                    <div style="font-weight: 600; font-size: 16px; color: #4ade80;">Update Available!</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.7);">v${SCRIPT_VERSION} → v${release.tag_name.replace(/^v/, '')}</div>
                </div>
            </div>
            <div style="margin-bottom: 16px; font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.4;">
                <strong>What's New:</strong><br><br> ${releaseNotes}
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <a href="https://raw.githubusercontent.com/${GITHUB_REPO}/main/jf_enhanced.js" target="_blank" style="background: #1a5f1a; border: 1px solid #4ade80; color: white; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;">📄 View Latest</a>
                <a href="https://github.com/${GITHUB_REPO}/releases/latest" target="_blank" style="background: #3e74f2bd; border: 1px solid #779aeadc; color: white; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;">📋 Release Notes</a>
                <button onclick="this.parentElement.parentElement.remove()" style="background: #f25151b5; border: 1px solid #f2515133; color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-family: inherit; font-weight: 500; cursor: pointer;">✕ Later</button>
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.6);">
                Please update through your userscript manager or installation method.
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 10);
        setTimeout(() => {
            if (document.getElementById(notificationId)) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => { notification.remove(); }, 300);
            }
        }, CONFIG.HELP_PANEL_AUTOCLOSE_DELAY);
    };

    // Automatically check for updates on script load if it has been longer than the defined interval.
    const lastCheck = localStorage.getItem('jellyfinEnhancedLastUpdateCheck');
    if (!lastCheck || Date.now() - parseInt(lastCheck) > CONFIG.UPDATE_CHECK_INTERVAL) {
        setTimeout(() => checkForUpdates(), 2000);
    }

    // Injects custom CSS for animations and other minor style adjustments.
    const injectRandomButtonStyles = () => {
        const styleId = 'jellyfin-enhanced-styles';
        if (document.getElementById(styleId)) return; // Don't inject styles twice
        const style = document.createElement('style');
        style.id = styleId;
        /* Animation for the random button's dice icon on hover */
        /* Hide the mobile-specific OSD settings button on desktop layouts */
        style.innerHTML = `
            @keyframes dice {
                0% { transform: rotate(0deg); }
                10% { transform: rotate(-15deg); }
                20% { transform: rotate(15deg); }
                30% { transform: rotate(-15deg); }
                40% { transform: rotate(15deg); }
                50% { transform: rotate(-15deg); }
                60% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            button#randomItemButton:not(.loading):hover .material-icons {
                animation: dice 1.5s;
            }
            .layout-desktop #enhancedSettingsBtn {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    };

    /*
     * --------------------------------------------------------------------------------
     * RANDOM BUTTON FUNCTIONALITY
     * - Adds a "Random" button to the header to navigate to a random item.
     * --------------------------------------------------------------------------------
     */

    // Retrieves the base URL of the current Jellyfin server.
    const getJellyfinServerAddress = () => window.location.origin;

    // Fetches a random item (Movie or Series) from the user's library via the API.
    const getRandomItem = async () => {
        const userId = ApiClient.getCurrentUserId();
        if (!userId) {
            console.error("Jellyfin Enhanced: User not logged in.");
            return null;
        }

        const serverAddress = getJellyfinServerAddress();
        const settings = loadSettings();
        const itemTypes = [];
        if (settings.randomIncludeMovies) itemTypes.push('Movie');
        if (settings.randomIncludeShows) itemTypes.push('Series');
        const includeItemTypes = itemTypes.length > 0 ? itemTypes.join(',') : 'Movie,Series';

        // Construct the API URL to fetch a list of random items
        const apiUrl = `${serverAddress}/Users/${userId}/Items?IncludeItemTypes=${includeItemTypes}&Recursive=true&SortBy=Random&Limit=20&Fields=ExternalUrls&_=${Date.now()}`;

        try {
            const response = await ApiClient.ajax({
                type: 'GET',
                url: apiUrl,
                headers: { 'Content-Type': 'application/json' },
                dataType: 'json'
            });

            if (response && response.Items && response.Items.length > 0) {
                // Pick one item from the fetched list
                const randomIndex = Math.floor(Math.random() * response.Items.length);
                return response.Items[randomIndex];
            } else {
                throw new Error('No items found in selected libraries.');
            }
        } catch (error) {
            console.error('Jellyfin Enhanced: Error fetching random item:', error);
            toast(`❌ ${error.message || 'Unknown error'}`, 2000);
            return null;
        }
    };

    // Navigates the browser to the details page of the given item.
    const navigateToItem = (item) => {
        if (item && item.Id) {
            const serverAddress = getJellyfinServerAddress();
            const serverId = ApiClient.serverId();
            const itemUrl = `${serverAddress}/web/index.html#!/details?id=${item.Id}${serverId ? `&serverId=${serverId}` : ''}`;
            window.location.href = itemUrl;
            toast(`🎲 Random Item Loaded`, 2000);
        } else {
            console.error('Jellyfin Enhanced: Invalid item object or ID:', item);
            toast('❌ Uh oh! Something went wrong!', 2000);
        }
    };

    // Creates and injects the "Random" button into the page header.
    const addRandomButton = () => {
        const settings = loadSettings();
        if (!settings.randomButtonEnabled) {
            const existingButton = document.getElementById('randomItemButtonContainer');
            if (existingButton) existingButton.remove();
            return;
        }

        // Check if the button already exists to prevent duplicates.
        if (document.getElementById('randomItemButton')) return;

        // The container helps with positioning in different Jellyfin layouts.
        let buttonContainer = document.createElement('div');
        buttonContainer.id = 'randomItemButtonContainer';

        const randomButton = document.createElement('button');
        randomButton.id = 'randomItemButton';
        // Use 'is' attribute to ensure Jellyfin applies its native button styling.
        randomButton.setAttribute('is', 'paper-icon-button-light');
        // Apply standard Jellyfin header classes for consistent theming.
        randomButton.className = 'headerButton headerButtonRight paper-icon-button-light';
        randomButton.title = 'Show a random item from your library (R)';
        randomButton.innerHTML = `<i class="material-icons">casino</i>`;

        randomButton.addEventListener('click', async () => {
            // Disable button and show a loading state.
            randomButton.disabled = true;
            randomButton.classList.add('loading'); // Use a class for the loading state.
            randomButton.innerHTML = '<i class="material-icons">hourglass_empty</i>';

            try {
                const item = await getRandomItem();
                if (item) {
                    navigateToItem(item);
                }
            } finally {
                // Re-enable the button after the operation.
                // A delay prevents the button from resetting before the page navigates away.
                setTimeout(() => {
                    if (document.getElementById(randomButton.id)) {
                        randomButton.disabled = false;
                        randomButton.classList.remove('loading');
                        randomButton.innerHTML = `<i class="material-icons">casino</i>`;
                    }
                }, 500);
            }
        });

        buttonContainer.appendChild(randomButton);
        const headerRight = document.querySelector('.headerRight');
        const searchInputContainer = document.querySelector('.searchInputContainer');

        if (headerRight) {
            headerRight.prepend(buttonContainer);
        } else if (searchInputContainer) {
            searchInputContainer.parentNode.insertBefore(buttonContainer, searchInputContainer.nextSibling);
        }
    };

    // Waits for Jellyfin's API client to be available before running functions that depend on it.
    const waitForApiClient = () => {
        if (typeof ApiClient !== 'undefined' && typeof ApiClient.getCurrentUserId === 'function' && typeof ApiClient.ajax === 'function') {
            injectRandomButtonStyles();
            // Use a MutationObserver to re-apply the button if the header is ever re-rendered by Jellyfin.
            const observer = new MutationObserver(() => {
                addRandomButton();
            });
            observer.observe(document.body, { childList: true, subtree: true });
            addRandomButton(); // Initial call
        } else {
            setTimeout(waitForApiClient, 200); // Check again shortly
        }
    };

    // Initializer function.
    const initializeScript = () => {
        waitForApiClient();
    };

    initializeScript();

    /*
     * --------------------------------------------------------------------------------
     * HELPER FUNCTIONS & UI
     * - General utility functions used throughout the script.
     * --------------------------------------------------------------------------------
     */

    // Checks if the current page is a video playback page.
    const isVideoPage = () => location.hash.startsWith('#/video');

    // Finds the main settings button in the video player OSD.
    const settingsBtn = () => document.querySelector('button[title="Settings"],button[aria-label="Settings"]');

    // Opens the player settings menu and executes a callback function.
    const openSettings = (cb) => {
        settingsBtn()?.click();
        setTimeout(cb, 120); // Wait for the menu to animate open
    };

    // Displays a short-lived message (toast notification) at the bottom-right of the screen.
    const toast = (txt, duration = CONFIG.TOAST_DURATION) => {
        const getJellyfinThemeVariable = (variableName, defaultValue) => {
            const rootStyle = getComputedStyle(document.documentElement);
            const value = rootStyle.getPropertyValue(variableName).trim();
            return value ? value : defaultValue;
        };

        const isJellyfishThemeActive = getJellyfinThemeVariable('--theme-updated-on', '') !== '' || getJellyfinThemeVariable('--theme-name', '').toLowerCase().includes('jellyfish');
        let toastBg, toastBlur, toastBorder;

        if (isJellyfishThemeActive) {
            toastBg = getJellyfinThemeVariable('--primary-background-transparent', 'rgba(0,0,0,0.6)');
            toastBlur = getJellyfinThemeVariable('--blur', '15px');
            toastBorder = `1px solid ${getJellyfinThemeVariable('--primary-accent-color', 'rgba(255,255,255,0.1)')}`;
        } else {
            toastBg = 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(40,40,40,0.9))';
            toastBlur = '15px';
            toastBorder = '1px solid rgba(255,255,255,0.1)';
        }

        const t = document.createElement('div');
        t.className = 'jellyfin-enhanced-toast';
        Object.assign(t.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            transform: 'translateX(100%)',
            background: toastBg,
            color: '#fff',
            padding: '10px 14px',
            borderRadius: '8px',
            zIndex: 99999,
            fontSize: 'clamp(13px, 2vw, 16px)',
            fontWeight: '500',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            backdropFilter: `blur(${toastBlur})`,
            border: toastBorder,
            transition: 'transform 0.3s ease-out',
            maxWidth: 'clamp(280px, 80vw, 350px)'
        });
        t.textContent = txt;
        document.body.appendChild(t);
        setTimeout(() => t.style.transform = 'translateX(0)', 10);
        setTimeout(() => {
            t.style.transform = 'translateX(100%)';
            setTimeout(() => t.remove(), 300);
        }, duration);
    };

    /*
     * --------------------------------------------------------------------------------
     * SUBTITLE CUSTOMIZATION
     * - Presets and functions for changing subtitle appearance.
     * --------------------------------------------------------------------------------
     */
    const subtitlePresets = [
        { name: "Clean White", textColor: "#FFFFFFFF", bgColor: "transparent", previewText: "Aa" },
        { name: "Classic Black Box", textColor: "#FFFFFFFF", bgColor: "#000000FF", previewText: "Aa" },
        { name: "Netflix Style", textColor: "#FFFFFFFF", bgColor: "#000000B2", previewText: "Aa" },
        { name: "Cinema Yellow", textColor: "#FFFF00FF", bgColor: "#000000B2", previewText: "Aa" },
        { name: "Soft Gray", textColor: "#FFFFFFFF", bgColor: "#444444B2", previewText: "Aa" },
        { name: "High Contrast", textColor: "#000000FF", bgColor: "#FFFFFFFF", previewText: "Aa" }
    ];

    const fontSizePresets = [
        { name: "Tiny", size: 0.6, previewText: "Aa" },
        { name: "Small", size: 0.8, previewText: "Aa" },
        { name: "Normal", size: 1.0, previewText: "Aa" },
        { name: "Large", size: 1.3, previewText: "Aa" },
        { name: "Extra Large", size: 1.6, previewText: "Aa" }
    ];

    const fontFamilyPresets = [
        { name: "Default", family: "inherit", previewText: "AaBb" },
        { name: "Noto Sans", family: "Noto Sans,sans-serif", previewText: "AaBb" },
        { name: "Sans Serif", family: "Arial,Helvetica,sans-serif", previewText: "AaBb" },
        { name: "Typewriter", family: "Courier New,Courier,monospace", previewText: "AaBb" },
        { name: "Roboto", family: "Roboto Mono,monospace", previewText: "AaBb" }
    ];

    // Applies the selected subtitle styles by modifying or creating a style element.
    const applySubtitleStyles = (textColor, bgColor, fontSize, fontFamily) => {
        let styleElement = document.getElementById('htmlvideoplayer-cuestyle');
        let isFallback = false;

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

        const selectors = isFallback ?
            ['.htmlvideoplayer::cue', 'video::cue', '::cue', 'video > track::cue'] :
            ['.htmlvideoplayer::cue'];

        try {
            // Clear existing rules to avoid conflicts
            while (sheet.cssRules.length > 0) {
                sheet.deleteRule(0);
            }
            // Insert the new, consolidated rule
            const newRule = `
                ${selectors.join(', ')} {
                    background-color: ${bgColor} !important;
                    color: ${textColor} !important;
                    font-size: ${fontSize}em !important;
                    font-family: ${fontFamily} !important;
                }
            `;
            sheet.insertRule(newRule, 0);

        } catch (e) {
            console.error("Failed to apply subtitle styles:", e);
        }
    };

    /*
     * --------------------------------------------------------------------------------
     * SETTINGS PERSISTENCE
     * - Saves and loads script settings from localStorage.
     * --------------------------------------------------------------------------------
     */
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
            // Return saved settings or a default configuration.
            return settings || {
                autoPauseEnabled: true,
                autoResumeEnabled: false,
                selectedStylePresetIndex: 0,
                selectedFontSizePresetIndex: 2,
                selectedFontFamilyPresetIndex: 0,
                randomButtonEnabled: true,
                randomIncludeMovies: true,
                randomIncludeShows: true
            };
        } catch (e) {
            console.error('Error loading settings:', e);
            // Fallback to default settings on error.
            return {
                autoPauseEnabled: true,
                autoResumeEnabled: false,
                selectedStylePresetIndex: 0,
                selectedFontSizePresetIndex: 2,
                selectedFontFamilyPresetIndex: 0,
                randomButtonEnabled: true,
                randomIncludeMovies: true,
                randomIncludeShows: true
            };
        }
    };

    let currentSettings = loadSettings();

    // Applies the saved subtitle styles when the script loads.
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

    /*
     * --------------------------------------------------------------------------------
     * OBSERVERS & EVENT LISTENERS
     * - React to changes in the DOM and browser state.
     * --------------------------------------------------------------------------------
     */

    // Adds a button to the mobile video player OSD to open the settings panel.
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
            showEnhancedPanel();
        };

        nativeSettingsButton.parentElement.insertBefore(enhancedSettingsBtn, nativeSettingsButton);
    };

    // Observes the DOM for changes to ensure styles and buttons are always applied.
    const setupStyleObserver = () => {
        let isApplyingStyles = false;
        const observer = new MutationObserver(() => {
            // Apply subtitle styles and add OSD button when needed.
            if (!isApplyingStyles) {
                isApplyingStyles = true;
                setTimeout(() => {
                    applySavedStylesWhenReady();
                    isApplyingStyles = false;
                }, 100);
            }
            if (isVideoPage()) {
                addOsdSettingsButton();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true, attributes: false });

        // Re-apply styles on fullscreen change, as some browsers reset them.
        document.addEventListener('fullscreenchange', () => {
            setTimeout(() => {
                if (!isApplyingStyles) applySavedStylesWhenReady();
            }, 200);
        });
    };

    setupStyleObserver();
    applySavedStylesWhenReady();

    /*
     * --------------------------------------------------------------------------------
     * VIDEO CONTROL FUNCTIONS
     * - Functions for controlling video playback (speed, seeking, etc.).
     * --------------------------------------------------------------------------------
     */

    // Gets the current video element on the page.
    const getVideo = () => document.querySelector('video');

    // Clicks the "Skip Intro" button if it's visible.
    const skipIntro = () => {
        const skipButton = document.querySelector('button.skip-button.emby-button:not(.skip-button-hidden):not(.hide)');
        if (skipButton && skipButton.textContent.includes('Skip Intro')) {
            skipButton.click();
            toast('⏭️ Skipped');
        } else {
            toast('❌ Skip Intro not available');
        }
    };

    // Adjusts playback speed up or down through a predefined list of speeds.
    const adjustPlaybackSpeed = (direction) => {
        const video = getVideo();
        if (!video) {
            toast('❌ No Video Found');
            return;
        }
        const speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
        let currentIndex = speeds.findIndex(speed => Math.abs(speed - video.playbackRate) < 0.01);
        if (currentIndex === -1) {
            currentIndex = speeds.findIndex(speed => speed >= video.playbackRate);
            if (currentIndex === -1) currentIndex = speeds.length - 1;
        }
        if (direction === 'increase') {
            currentIndex = Math.min(currentIndex + 1, speeds.length - 1);
        } else {
            currentIndex = Math.max(currentIndex - 1, 0);
        }
        video.playbackRate = speeds[currentIndex];
        toast(`⚡ Speed: ${speeds[currentIndex]}x`);
    };

    // Resets the video playback speed to normal (1.0x).
    const resetPlaybackSpeed = () => {
        const video = getVideo();
        if (!video) {
            toast('❌ No Video Found');
            return;
        }
        video.playbackRate = 1.0;
        toast('⚡ Speed: Normal');
    };

    // Jumps to a specific percentage of the video's duration.
    const jumpToPercentage = (percentage) => {
        const video = getVideo();
        if (!video || !video.duration) {
            toast('❌ No Video Found');
            return;
        }

        // Only realized while testing this, that Jellyfin has this functionality natively, might be unknown to some, so will leave the toast message for some visual feedback

        // const targetTime = (video.duration * percentage) / 100;
        // video.currentTime = targetTime;
        toast(`⏭️ Jumped to ${percentage}%`);
    };

    // Cycles through available subtitle tracks.
    const cycleSubtitleTrack = () => {
        // This function finds the subtitle menu and clicks the next available option. (There is probably a much better way to do this, but for the love of god, I cannot figure it out.)
        const performCycle = () => {
            // Step 1: Get all list items in the action sheet using a general selector.
            const allItems = document.querySelectorAll('.actionSheetContent .listItem');

            if (allItems.length === 0) {
                toast('❌ No Subtitles Found');
                document.body.click();
                return;
            }

            // Step 2: Filter the items to get only the actual, selectable subtitle tracks.
            const subtitleOptions = Array.from(allItems).filter(item => {
                const textElement = item.querySelector('.listItemBodyText');
                if (!textElement) return false; // Ignore if it has no text.

                const text = textElement.textContent.trim();
                // Exclude Secondary Subtitles from the list.
                if (text === 'Secondary Subtitles') return false;
                // Return true if the item has text and is not a secondary subtitle.
                return true;
            });

            if (subtitleOptions.length === 0) {
                toast('❌ No Subtitles Found');
                // Close the now-empty menu
                document.body.click();
                return;
            }

            // Step 3: Find the currently selected subtitle by looking for the checkmark icon.
            let currentIndex = -1;
            // Find the currently selected subtitle by looking for the checkmark icon
            subtitleOptions.forEach((option, index) => {
                const checkIcon = option.querySelector('.listItemIcon.check');
                // Check if the icon exists and is visible
                if (checkIcon && getComputedStyle(checkIcon).visibility !== 'hidden') {
                    currentIndex = index;
                }
            });

            // Step 4: Calculate the next index and click the corresponding option.
            const nextIndex = (currentIndex + 1) % subtitleOptions.length;
            const nextOption = subtitleOptions[nextIndex];

            if (nextOption) {
                // Click the next subtitle option
                nextOption.click();
                // Show a confirmation toast with the name of the selected subtitle
                const subtitleName = nextOption.querySelector('.listItemBodyText').textContent.trim();
                toast(`📝 Subtitle: ${subtitleName}`);
            }
        };

        // Check if the subtitle menu is already open by looking for its title
        const subtitleMenuTitle = Array.from(document.querySelectorAll('.actionSheetContent .actionSheetTitle')).find(el => el.textContent === 'Subtitles');

        if (subtitleMenuTitle) {
            // If the menu is already open, just cycle the options
            performCycle();
        } else {
            // If any other menu is open, close it first before opening the subtitle menu
            if (document.querySelector('.actionSheetContent')) {
                document.body.click();
            }
            // Click the main subtitle button in the player controls
            document.querySelector('button.btnSubtitles')?.click();
            // Wait a moment for the menu to open, then perform the cycle
            setTimeout(performCycle, 200);
        }
    };

    // Cycles through available audio tracks.
    const cycleAudioTrack = () => {
        // This function finds the audio menu and clicks the next available option, similar to subtitle cycling
        const performCycle = () => {
            // Step 1: Get all list items in the action sheet using a general selector.
            const allItems = document.querySelectorAll('.actionSheetContent .listItem');

            if (allItems.length === 0) {
                toast('❌ No Audio Tracks Found');
                document.body.click();
                return;
            }

            // Step 2: Filter the items to get only the actual, selectable audio tracks.
            const audioOptions = Array.from(allItems).filter(item => {
                const textElement = item.querySelector('.listItemBodyText.actionSheetItemText');
                if (!textElement) return false; // Ignore if it has no text.

                const text = textElement.textContent.trim();
                // Include items that look like audio tracks (containing language info, codec info, etc.)
                return text.length > 0;
            });

            if (audioOptions.length === 0) {
                toast('❌ No Audio Tracks Found');
                // Close the now-empty menu
                document.body.click();
                return;
            }

            // Step 3: Find the currently selected audio track by looking for the checkmark icon.
            let currentIndex = -1;
            // Find the currently selected audio track by looking for the checkmark icon
            audioOptions.forEach((option, index) => {
                const checkIcon = option.querySelector('.actionsheetMenuItemIcon.listItemIcon.check');
                // Check if the icon exists and is visible
                if (checkIcon && getComputedStyle(checkIcon).visibility !== 'hidden') {
                    currentIndex = index;
                }
            });

            // Step 4: Calculate the next index and click the corresponding option.
            const nextIndex = (currentIndex + 1) % audioOptions.length;
            const nextOption = audioOptions[nextIndex];

            if (nextOption) {
                // Click the next audio option
                nextOption.click();
                // Show a confirmation toast with the name of the selected audio track
                const audioName = nextOption.querySelector('.listItemBodyText.actionSheetItemText').textContent.trim();
                toast(`🎵 Audio: ${audioName}`);
            }
        };

        // Check if the audio menu is already open by looking for its title
        const audioMenuTitle = Array.from(document.querySelectorAll('.actionSheetContent .actionSheetTitle')).find(el => el.textContent === 'Audio');

        if (audioMenuTitle) {
            // If the menu is already open, just cycle the options
            performCycle();
        } else {
            // If any other menu is open, close it first before opening the audio menu
            if (document.querySelector('.actionSheetContent')) {
                document.body.click();
            }
            // Click the main audio button in the player controls
            document.querySelector('button.btnAudio')?.click();
            // Wait a moment for the menu to open, then perform the cycle
            setTimeout(performCycle, 200);
        }
    };

    // Cycles through video aspect ratio modes (Auto, Cover, Fill).
    const cycleAspect = () => {
        const opts = [...document.querySelectorAll('.actionSheetContent button[data-id="auto"], .actionSheetContent button[data-id="cover"], .actionSheetContent button[data-id="fill"]')];
        if (!opts.length) {
            document.querySelector('.actionSheetContent button[data-id="aspectratio"]')?.click();
            return setTimeout(cycleAspect, 120);
        }
        const current = opts.findIndex(b => b.querySelector('.check')?.style.visibility !== 'hidden');
        const next = opts[(current + 1) % opts.length];
        next?.click();
        toast(`📐 Aspect Ratio: ${next?.textContent.trim()}`);
    };

    /*
     * --------------------------------------------------------------------------------
     * SETTINGS & HELP PANEL
     * - A comprehensive UI panel for script settings and shortcuts
     * --------------------------------------------------------------------------------
     */
    const showEnhancedPanel = () => {
        const panelId = 'jellyfin-enhanced-panel';
        const existing = document.getElementById(panelId);
        if (existing) {
            existing.remove();
            return;
        }
        // Get the Jellyfish theme variables to apply consistent styles.
        const getJellyfinThemeVariable = (variableName, defaultValue) => {
            const rootStyle = getComputedStyle(document.documentElement);
            const value = rootStyle.getPropertyValue(variableName).trim();
            return value ? value : defaultValue;
        };

        // this should definetely need improvement, 1. to identify Jellyfish Theme, 2. to use the variables in a more consistent way, but for now it works
        const isJellyfishThemeActive = getJellyfinThemeVariable('--theme-updated-on', '') !== '' || getJellyfinThemeVariable('--theme-name', '').toLowerCase().includes('jellyfish');
        let panelBgColor, secondaryBg, headerFooterBg, primaryAccentColor, toggleAccentColor, kbdBackground, presetBoxBackground, detailsBackground, panelBlurValue, githubButtonBg, checkUpdatesBg, checkUpdatesBorder, checkUpdatesTextColor, logoUrl;
        if (isJellyfishThemeActive) {
            panelBgColor = getJellyfinThemeVariable('--primary-background-transparent', 'rgba(0,0,0,0.95)');
            secondaryBg = getJellyfinThemeVariable('--secondary-background-transparent', 'rgba(0,0,0,0.2)');
            headerFooterBg = secondaryBg;
            detailsBackground = secondaryBg;
            primaryAccentColor = getJellyfinThemeVariable('--primary-accent-color', '#00A4DC');
            toggleAccentColor = primaryAccentColor;
            kbdBackground = getJellyfinThemeVariable('--alt-accent-color', '#ffffff20');
            presetBoxBackground = getJellyfinThemeVariable('--alt-accent-color', '#ffffff20');
            panelBlurValue = getJellyfinThemeVariable('--blur', '20px');
            githubButtonBg = 'rgba(102, 179, 255, 0.1)';
            checkUpdatesBg = primaryAccentColor;
            checkUpdatesBorder = `1px solid ${primaryAccentColor}`;
            checkUpdatesTextColor = getJellyfinThemeVariable('--text-color', '#000000');
            const rawLogoValue = getJellyfinThemeVariable('--logo', '');
            logoUrl = rawLogoValue.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
        } else {
            panelBgColor = 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,20,0.95))';
            headerFooterBg = 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,20,0.95))';
            detailsBackground = 'rgba(0,0,0,0.2)';
            primaryAccentColor = '#00A4DC';
            toggleAccentColor = '#AA5CC3';
            kbdBackground = 'rgba(255,255,255,0.1)';
            presetBoxBackground = 'rgba(255,255,255,0.05)';
            panelBlurValue = '20px';
            githubButtonBg = 'rgba(102, 179, 255, 0.1)';
            checkUpdatesBg = 'linear-gradient(135deg, #AA5CC3, #00A4DC)';
            checkUpdatesBorder = `1px solid ${primaryAccentColor}`;
            checkUpdatesTextColor = '#FFFFFF';
        }

        const help = document.createElement('div');
        help.id = panelId;
        Object.assign(help.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgb(24, 24, 24)',
            color: '#fff',
            padding: '0',
            borderRadius: '16px',
            zIndex: 999999,
            fontSize: '14px',
            backdropFilter: `blur(${panelBlurValue})`,
            maxWidth: '90vw',
            minWidth: '300px',
            maxHeight: '90vh',
            boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            cursor: 'grab',
            display: 'flex',
            fontFamily: 'inherit',
            flexDirection: 'column'
        });

        // --- Draggable Panel Logic (restored) ---
        let isDragging = false;
        let offset = { x: 0, y: 0 };
        let autoCloseTimer = null;
        let isMouseInside = false;

        const resetAutoCloseTimer = () => {
            if (autoCloseTimer) clearTimeout(autoCloseTimer);
            autoCloseTimer = setTimeout(() => {
                if (!isMouseInside && document.getElementById(panelId)) {
                    help.remove();
                    document.removeEventListener('keydown', closeHelp);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    document.addEventListener('keydown', keyListener);
                }
            }, CONFIG.HELP_PANEL_AUTOCLOSE_DELAY);
        };

        const handleMouseDown = (e) => {
            if (e.target.closest('.preset-box, button, a, details, input')) return;
            isDragging = true;
            offset = { x: e.clientX - help.getBoundingClientRect().left, y: e.clientY - help.getBoundingClientRect().top };
            help.style.cursor = 'grabbing';
            e.preventDefault();
            resetAutoCloseTimer();
        };

        const handleMouseMove = (e) => {
            if (isDragging) {
                help.style.left = `${e.clientX - offset.x}px`;
                help.style.top = `${e.clientY - offset.y}px`;
                help.style.transform = 'none';
            }
            resetAutoCloseTimer();
        };

        const handleMouseUp = () => {
            isDragging = false;
            help.style.cursor = 'grab';
            resetAutoCloseTimer();
        };

        help.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        // Reset the auto-close timer when the mouse enters or leaves the panel.
        help.addEventListener('mouseenter', () => { isMouseInside = true; if (autoCloseTimer) clearTimeout(autoCloseTimer); });
        help.addEventListener('mouseleave', () => { isMouseInside = false; resetAutoCloseTimer(); });
        help.addEventListener('click', resetAutoCloseTimer);
        help.addEventListener('wheel', (e) => { e.stopPropagation(); resetAutoCloseTimer(); });


        const generatePresetHTML = (presets, type) => {
            return presets.map((preset, index) => {
                let previewStyle = '';
                if (type === 'style') {
                    previewStyle = `background-color: ${preset.bgColor}; color: ${preset.textColor}; border: 1px solid rgba(255,255,255,0.3); text-shadow: #000000 0px 0px 3px;`;
                } else if (type === 'font-size') {
                    previewStyle = `font-size: ${preset.size * 1.2}em; color: #fff; text-shadow: 0 0 4px rgba(0,0,0,0.8);`;
                } else if (type === 'font-family') {
                    previewStyle = `font-family: ${preset.family}; color: #fff; text-shadow: 0 0 4px rgba(0,0,0,0.8); font-size: 1.5em;`;
                }
                return `
                    <div class="preset-box ${type}-preset" data-preset-index="${index}" title="${preset.name}" style="display: flex; justify-content: center; align-items: center; padding: 8px; border: 2px solid transparent; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: ${presetBoxBackground}; min-height: 30px;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='${presetBoxBackground}'">
                        <span style="display: inline-block; ${type === 'style' ? `width: 40px; height: 25px; border-radius: 4px; line-height: 25px;` : ''} ${previewStyle} text-align: center; font-weight: bold;">${preset.previewText}</span>
                    </div>`;
            }).join('');
        };

        help.innerHTML = `
            <div style="padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); background: ${headerFooterBg};">
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px; text-align: center; background: ${primaryAccentColor}; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🪼 Jellyfin Enhanced</div>
                <div style="text-align: center; font-size: 12px; color: rgba(255,255,255,0.8);">Version ${SCRIPT_VERSION}</div>
            </div>
            <div style="padding: 0 20px; flex: 1; overflow-y: auto; position: relative; background: ${panelBgColor};">
                <div style="padding-top: 20px; padding-bottom: 20px;">
                    <!-- Keyboard Shortcut Sections -->
                    <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 24px;">
                        <div style="flex: 1; min-width: 400px;">
                            <h3 style="margin: 0 0 12px 0; font-size: 18px; color: ${primaryAccentColor};">Global</h3>
                            <div style="display: grid; gap: 8px; font-size: 14px;">
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">/</kbd></span><span>Open search</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">Shift + H</kbd></span><span>Go to home</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">D</kbd></span><span>Go to dashboard</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">Q</kbd></span><span>Quick Connect</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">R</kbd></span><span>Play Random Item</span></div>
                                <div style="display: flex; justify-content: space-between;"><span>Hold <kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">Shift + B</kbd></span><span>Clear all Bookmarks</span></div>
                            </div>
                        </div>
                        <div style="flex: 1; min-width: 400px;">
                            <h3 style="margin: 0 0 12px 0; font-size: 18px; color: ${primaryAccentColor};">Player</h3>
                            <div style="display: grid; gap: 8px; font-size: 14px;">
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">A</kbd></span><span>Cycle aspect ratio</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">I</kbd></span><span>Show playback info</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">S</kbd></span><span>Subtitle menu</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">C</kbd></span><span>Cycle subtitle tracks</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">V</kbd></span><span>Cycle audio tracks</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">N</kbd></span><span>Skip intro</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">+ / =</kbd></span><span>Increase playback speed</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">- / _</kbd></span><span>Decrease playback speed</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">R</kbd></span><span>Reset playback speed</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">B</kbd></span><span>Bookmark current time</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">Shift + B</kbd></span><span>Go to Saved Bookmark</span></div>
                                <div style="display: flex; justify-content: space-between;"><span><kbd style="background:${kbdBackground}; padding:2px 6px; border-radius:3px;">0-9</kbd></span><span>Jump to % of video</span></div>
                            </div>
                        </div>
                    </div>
                    <!-- Settings Sections -->
                    <details style="margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: ${detailsBackground};">
                        <summary style="padding: 16px; font-weight: 600; color: ${primaryAccentColor}; cursor: pointer; user-select: none;">⏯️ Auto-Pause Settings</summary>
                        <div style="padding: 0 16px 16px 16px;">
                            <div style="margin-bottom: 16px; padding: 12px; background: ${presetBoxBackground}; border-radius: 6px; border-left: 3px solid ${toggleAccentColor};">
                                <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                                    <input type="checkbox" id="autoPauseToggle" ${currentSettings.autoPauseEnabled ? 'checked' : ''} style="width:18px; height:18px; accent-color:${toggleAccentColor}; cursor:pointer;">
                                    <div><div style="font-weight:500;">Auto-pause</div><div style="font-size:12px; color:rgba(255,255,255,0.6); margin-top:2px;">Pause when switching tabs</div></div>
                                </label>
                            </div>
                            <div style="padding: 12px; background: ${presetBoxBackground}; border-radius: 6px; border-left: 3px solid ${toggleAccentColor};">
                                <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                                    <input type="checkbox" id="autoResumeToggle" ${currentSettings.autoResumeEnabled ? 'checked' : ''} style="width:18px; height:18px; accent-color:${toggleAccentColor}; cursor:pointer;">
                                    <div><div style="font-weight:500;">Auto-resume</div><div style="font-size:12px; color:rgba(255,255,255,0.6); margin-top:2px;">Resume when returning to tab</div></div>
                                </label>
                            </div>
                        </div>
                    </details>
                    <details style="margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: ${detailsBackground};">
                        <summary style="padding: 16px; font-weight: 600; color: ${primaryAccentColor}; cursor: pointer; user-select: none;">📝 Subtitle Settings</summary>
                        <div style="padding: 0 16px 16px 16px;">
                            <div style="margin-bottom: 16px;"><div style="font-weight: 600; margin-bottom: 8px;">Style</div><div id="subtitle-style-presets-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px;">${generatePresetHTML(subtitlePresets, 'style')}</div></div>
                            <div style="margin-bottom: 16px;"><div style="font-weight: 600; margin-bottom: 8px;">Size</div><div id="font-size-presets-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px;">${generatePresetHTML(fontSizePresets, 'font-size')}</div></div>
                            <div><div style="font-weight: 600; margin-bottom: 8px;">Font</div><div id="font-family-presets-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px;">${generatePresetHTML(fontFamilyPresets, 'font-family')}</div></div>
                        </div>
                    </details>
                    <details style="margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: ${detailsBackground};">
                        <summary style="padding: 16px; font-weight: 600; color: ${primaryAccentColor}; cursor: pointer; user-select: none;">🎲 Random Button Settings</summary>
                        <div style="padding: 0 16px 16px 16px;">
                            <div style="margin-bottom:16px; padding:12px; background:${presetBoxBackground}; border-radius:6px; border-left:3px solid ${toggleAccentColor};">
                                <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;"><input type="checkbox" id="randomButtonToggle" ${currentSettings.randomButtonEnabled ? 'checked' : ''} style="width:18px; height:18px; accent-color:${toggleAccentColor}; cursor:pointer;"><div><div style="font-weight:500;">Enable Random Button</div><div style="font-size:12px; color:rgba(255,255,255,0.6); margin-top:2px;">Show random button in header</div></div></label>
                            </div>
                            <div style="font-weight:500; margin-bottom:8px;">Item Types</div>
                            <div style="display:flex; gap:16px; padding:12px; background:${presetBoxBackground}; border-radius:6px; border-left:3px solid ${toggleAccentColor};">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;"><input type="checkbox" id="randomIncludeMovies" ${currentSettings.randomIncludeMovies ? 'checked' : ''} style="width:18px; height:18px; accent-color:${toggleAccentColor}; cursor:pointer;"><span>Movies</span></label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;"><input type="checkbox" id="randomIncludeShows" ${currentSettings.randomIncludeShows ? 'checked' : ''} style="width:18px; height:18px; accent-color:${toggleAccentColor}; cursor:pointer;"><span>Shows</span></label>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
            <div style="padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.1); background: ${headerFooterBg}; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size:12px; color:rgba(255,255,255,0.5);">Press <kbd style="background:${kbdBackground}; padding:2px 4px; border-radius:3px;">?</kbd> or <kbd style="background:${kbdBackground}; padding:2px 4px; border-radius:3px;">Esc</kbd> to close</div>
                ${logoUrl ? `<img src="${logoUrl}" alt="Theme Logo" style="height: 40px;">` : ''}
                <div style="display:flex; gap:12px; align-items:center;">
                    <button id="checkUpdatesBtn" style="font-family:inherit; background:${updateAvailable ? 'linear-gradient(135deg, #1a5f1a, #2d8f2d)' : checkUpdatesBg}; color:${checkUpdatesTextColor}; border:${updateAvailable ? '1px solid #4ade80' : checkUpdatesBorder}; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:500; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:6px;" onmouseover="this.style.background='${updateAvailable ? 'linear-gradient(135deg, #2d8f2d, #4ade80)' : primaryAccentColor}'" onmouseout="this.style.background='${updateAvailable ? 'linear-gradient(135deg, #1a5f1a, #2d8f2d)' : checkUpdatesBg}'">${updateAvailable ? '📦 Update Available' : '🔄️ Check Updates'}</button>
                    <a href="https://github.com/${GITHUB_REPO}/" target="_blank" style="color:${primaryAccentColor}; text-decoration:none; display:flex; align-items:center; gap:6px; font-size:12px; padding:4px 8px; border-radius:4px; background:${githubButtonBg}; transition:background 0.2s;" onmouseover="this.style.background='rgba(102, 179, 255, 0.2)'" onmouseout="this.style.background='${githubButtonBg}'"><svg height="12" viewBox="0 0 24 24" width="12" fill="currentColor"><path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z"></path></svg> Contribute</a>
                </div>
            </div>
            <button id="closeSettingsPanel" style="position:absolute; top:24px; right:24px; background:rgba(255,255,255,0.1); border:none; color:#fff; font-size:16px; cursor:pointer; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">×</button>
        `;

        document.body.appendChild(help);
        resetAutoCloseTimer();

        // Autoscroll when details sections open
        const allDetails = help.querySelectorAll('details');
        allDetails.forEach((details, index) => {
            details.addEventListener('toggle', () => {
                if (details.open) {
                    setTimeout(() => {
                        details.scrollIntoView({ behavior: 'smooth', block: index === 0 ? 'center' : 'nearest' });
                    }, 150);
                }
                resetAutoCloseTimer();
            });
        });

        // --- Event Handlers for Settings Panel ---
        const closeHelp = (ev) => {
            if ((ev.type === 'keydown' && (ev.key === 'Escape' || ev.key === '?')) || (ev.type === 'click' && ev.target.id === 'closeSettingsPanel')) {
                if(autoCloseTimer) clearTimeout(autoCloseTimer);
                help.remove();
                document.removeEventListener('keydown', closeHelp);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.addEventListener('keydown', keyListener);
            }
        };

        document.addEventListener('keydown', closeHelp);
        document.getElementById('closeSettingsPanel').addEventListener('click', closeHelp);
        document.removeEventListener('keydown', keyListener);

        // --- Variable declarations and event listeners ---
        const autoPauseToggle = document.getElementById('autoPauseToggle');
        const autoResumeToggle = document.getElementById('autoResumeToggle');
        const randomButtonToggle = document.getElementById('randomButtonToggle');
        const randomIncludeMovies = document.getElementById('randomIncludeMovies');
        const randomIncludeShows = document.getElementById('randomIncludeShows');

        autoPauseToggle.addEventListener('change', (e) => { currentSettings.autoPauseEnabled = e.target.checked; saveSettings(currentSettings); toast(`⏸️ Auto-Pause ${e.target.checked ? 'Enabled' : 'Disabled'}`); resetAutoCloseTimer(); });
        autoResumeToggle.addEventListener('change', (e) => { currentSettings.autoResumeEnabled = e.target.checked; saveSettings(currentSettings); toast(`▶️ Auto-Resume ${e.target.checked ? 'Enabled' : 'Disabled'}`); resetAutoCloseTimer(); });
        randomButtonToggle.addEventListener('change', (e) => { currentSettings.randomButtonEnabled = e.target.checked; saveSettings(currentSettings); toast(`🎲 Random Button ${e.target.checked ? 'Enabled' : 'Disabled'}`); addRandomButton(); resetAutoCloseTimer(); });
        randomIncludeMovies.addEventListener('change', (e) => { if (!e.target.checked && !randomIncludeShows.checked) { e.target.checked = true; toast('⚠️ At least one item type must be selected'); return; } currentSettings.randomIncludeMovies = e.target.checked; saveSettings(currentSettings); toast(`🎬 Movies ${e.target.checked ? 'included in' : 'excluded from'} random selection`); resetAutoCloseTimer(); });
        randomIncludeShows.addEventListener('change', (e) => { if (!e.target.checked && !randomIncludeMovies.checked) { e.target.checked = true; toast('⚠️ At least one item type must be selected'); return; } currentSettings.randomIncludeShows = e.target.checked; saveSettings(currentSettings); toast(`🍿 Shows ${e.target.checked ? 'included in' : 'excluded from'} random selection`); resetAutoCloseTimer(); });
        document.getElementById('checkUpdatesBtn').addEventListener('click', () => { if (updateAvailable && latestReleaseData) { showUpdateNotification(latestReleaseData); } else { checkForUpdates(true); } resetAutoCloseTimer(); });

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
                        toast(`🎨 Subtitle Style: ${selectedPreset.name}`);
                    } else if (type === 'font-size') {
                        currentSettings.selectedFontSizePresetIndex = presetIndex;
                        const styleIndex = currentSettings.selectedStylePresetIndex ?? 0;
                        const fontFamilyIndex = currentSettings.selectedFontFamilyPresetIndex ?? 0;
                        const stylePreset = subtitlePresets[styleIndex];
                        const fontFamily = fontFamilyPresets[fontFamilyIndex].family;
                        applySubtitleStyles(stylePreset.textColor, stylePreset.bgColor, selectedPreset.size, fontFamily);
                        toast(`📏 Subtitle Size: ${selectedPreset.name}`);
                    } else if (type === 'font-family') {
                        currentSettings.selectedFontFamilyPresetIndex = presetIndex;
                        const styleIndex = currentSettings.selectedStylePresetIndex ?? 0;
                        const fontSizeIndex = currentSettings.selectedFontSizePresetIndex ?? 2;
                        const stylePreset = subtitlePresets[styleIndex];
                        const fontSize = fontSizePresets[fontSizeIndex].size;
                        applySubtitleStyles(stylePreset.textColor, stylePreset.bgColor, fontSize, selectedPreset.family);
                        toast(`🔤 Subtitle Font: ${selectedPreset.name}`);
                    }

                    saveSettings(currentSettings);
                    container.querySelectorAll('.preset-box').forEach(box => {
                        box.style.border = '2px solid transparent';
                    });
                    presetBox.style.border = `2px solid ${primaryAccentColor}`;
                    resetAutoCloseTimer();
                }
            });

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
                activeBox.style.border = `2px solid ${primaryAccentColor}`;
            }
        };

        setupPresetHandlers('subtitle-style-presets-container', subtitlePresets, 'style');
        setupPresetHandlers('font-size-presets-container', fontSizePresets, 'font-size');
        setupPresetHandlers('font-family-presets-container', fontFamilyPresets, 'font-family');
    };

    /*
     * --------------------------------------------------------------------------------
     * KEYBOARD SHORTCUT SYSTEM
     * - Listens for keyboard shortcuts to trigger various actions.
     * --------------------------------------------------------------------------------
     */

    // Special listener for holding 'Shift+B' to clear all bookmarks.
    document.addEventListener('keydown', (e) => {
        if (e.key === 'B' && e.shiftKey && !isVideoPage()) {
            if (!shiftBTimer && !shiftBTriggered) {
                shiftBTimer = setTimeout(() => {
                    if (!shiftBTriggered) {
                        localStorage.removeItem('jellyfinEnhancedBookmarks');
                        toast('🗑️ All Bookmarks Cleared');
                        shiftBTriggered = true;
                    }
                }, CONFIG.CLEAR_BOOKMARKS_DELAY);
            }
        }
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === 'B') {
            if (shiftBTimer) clearTimeout(shiftBTimer);
            shiftBTimer = null;
            setTimeout(() => { shiftBTriggered = false; }, 100);
        }
    });

    // The main key listener for all other shortcuts.
    const keyListener = (e) => {
        // Ignore shortcuts if typing in an input field.
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        const key = e.key.toLowerCase();
        const video = getVideo();

        // --- Global Shortcuts ---
        if (key === '/' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            document.querySelector('button.headerSearchButton')?.click();
            setTimeout(() => document.querySelector('input[type="search"]')?.focus(), 100);
            toast('🔍 Search');
        } else if (e.shiftKey && key === 'h') {
            e.preventDefault();
            location.href = '/web/#/home.html';
            toast('🏠 Home');
        } else if (key === 'd' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            location.href = '/web/#/dashboard';
            toast('📊 Dashboard');
        } else if (key === 'q' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            location.href = '/web/#/quickconnect';
            toast('🔗 Quick Connect');
        } else if (key === '?') {
            e.preventDefault();
            showEnhancedPanel();
        } else if (key === 'r' && !e.ctrlKey && !e.altKey && !e.metaKey && !isVideoPage()) {
            e.preventDefault();
            document.getElementById('randomItemButton')?.click();
        }

        // --- Player-Only Shortcuts ---
        if (!isVideoPage()) return;

        // Prevent default browser actions for player shortcuts.
        const playerShortcuts = ['a', 'i', 's', 'c', 'v', 'n', 'r', 'b', '+', '=', '-', '_', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        if (playerShortcuts.includes(key) || e.key === 'B') {
            e.preventDefault();
            e.stopPropagation();
        }

        switch (e.key) { // Use e.key to differentiate between 'b' and 'B'
            case 'b': {// Set bookmark
                if (!video) return;
                const videoId = document.title?.replace(/^Playing:\s*/, '').trim() || 'unknown';
                const bookmarks = JSON.parse(localStorage.getItem('jellyfinEnhancedBookmarks') || '{}');
                bookmarks[videoId] = video.currentTime;
                localStorage.setItem('jellyfinEnhancedBookmarks', JSON.stringify(bookmarks));
                const h_set = Math.floor(video.currentTime / 3600);
                const m_set = Math.floor((video.currentTime % 3600) / 60);
                const s_set = Math.floor(video.currentTime % 60);
                toast(`📍 Bookmarked at ${h_set > 0 ? `${h_set}:` : ''}${m_set.toString().padStart(h_set > 0 ? 2 : 1, '0')}:${s_set.toString().padStart(2, '0')}`);
                break;
            }
            case 'B': { // Go to bookmark
                if (!video) return;
                const videoId_get = document.title?.replace(/^Playing:\s*/, '').trim() || 'unknown';
                const bookmarks_get = JSON.parse(localStorage.getItem('jellyfinEnhancedBookmarks') || '{}');
                const bookmarkTime = bookmarks_get[videoId_get];
                if (bookmarkTime !== undefined) {
                    video.currentTime = bookmarkTime;
                    const h_get = Math.floor(bookmarkTime / 3600);
                    const m_get = Math.floor((bookmarkTime % 3600) / 60);
                    const s_get = Math.floor(bookmarkTime % 60);
                    toast(`📍 Returned to bookmark at ${h_get > 0 ? `${h_get}:` : ''}${m_get.toString().padStart(h_get > 0 ? 2 : 1, '0')}:${s_get.toString().padStart(2, '0')}`);
                } else {
                    toast('❌ No Bookmarks Found!');
                }
                break;
            }
            case 'a': case 'A': openSettings(cycleAspect); break;
            case 'i': case 'I': openSettings(() => document.querySelector('.actionSheetContent button[data-id="stats"]')?.click()); break;
            case 's': case 'S': document.querySelector('button.btnSubtitles')?.click(); break;
            case 'c': case 'C': cycleSubtitleTrack(); break;
            case 'v': case 'V': cycleAudioTrack(); break;
            case 'n': case 'N': skipIntro(); break;
            case 'r': case 'R': resetPlaybackSpeed(); break;
            case '+': case '=': adjustPlaybackSpeed('increase'); break;
            case '-': case '_': adjustPlaybackSpeed('decrease'); break;
            case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
                jumpToPercentage(parseInt(e.key) * 10); break;
        }
    };
    document.addEventListener('keydown', keyListener);

    /* --- Auto-Pause/Resume on Tab Visibility Change --- */
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
})();