(function () {
    'use strict';
    // Global variables
    let shiftBTimer = null;
    let shiftBTriggered = false;

    // Script version
    const SCRIPT_VERSION = '3.1';
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
                toast('✅ You have the latest and greatest!', 2000);
            }

            // Update last check time
            localStorage.setItem('jellyfinEnhancedLastUpdateCheck', Date.now().toString());
        } catch (error) {
            console.error('Update check failed:', error);
            if (showToast) {
                toast('❌ Update Check Failed!', 2000);
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

    /* --------------- Random Button --------------- */
    const getJellyfinServerAddress = () => window.location.origin;

    const getRandomItem = async () => {
        const userId = ApiClient.getCurrentUserId();
        if (!userId) {
            console.error("Jellyfin Enhanced: User not logged in.");
            return null;
        }

        const serverAddress = getJellyfinServerAddress();
        const timestamp = Date.now();
        const fetchLimit = 20;
        const settings = loadSettings();
        const itemTypes = [];
        if (settings.randomIncludeMovies) itemTypes.push('Movie');
        if (settings.randomIncludeShows) itemTypes.push('Series');
        const includeItemTypes = itemTypes.length > 0 ? itemTypes.join(',') : 'Movie,Series';

        const apiUrl = `${serverAddress}/Users/${userId}/Items?IncludeItemTypes=${includeItemTypes}&Recursive=true&SortBy=Random&Limit=${fetchLimit}&Fields=ExternalUrls&_=${timestamp}`;

        try {
            const response = await ApiClient.ajax({
                type: 'GET',
                url: apiUrl,
                headers: { 'Content-Type': 'application/json' },
                dataType: 'json'
            });

            if (response && response.Items && response.Items.length > 0) {
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

    const injectRandomButtonStyles = () => {
        const styleId = 'jellyfin-enhanced-styles';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
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
            button#randomItemButton {
                padding: 0px !important;
                margin: 0px 5px 0px 10px !important;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            button#randomItemButton:hover .material-icons {
                animation: dice 1.5s;
            }
            /* Hide the settings button on desktop */
            .layout-desktop #enhancedSettingsBtn {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    };

    const addRandomButton = () => {
        const settings = loadSettings();
        if (!settings.randomButtonEnabled) return;

        let buttonContainer = document.getElementById('randomItemButtonContainer');
        if (!buttonContainer) {
            buttonContainer = document.createElement('div');
            buttonContainer.id = 'randomItemButtonContainer';
        }

        let randomButton = document.getElementById('randomItemButton');
        if (!randomButton) {
            randomButton = document.createElement('button');
            randomButton.id = 'randomItemButton';
            randomButton.className = 'random-item-button emby-button button-flat button-flat-hover';
            randomButton.title = 'Play a random item from your library';
            randomButton.innerHTML = `<i class="material-icons">casino</i>`;

            randomButton.addEventListener('click', async () => {
                randomButton.disabled = true;
                randomButton.innerHTML = '<i class="material-icons">hourglass_empty</i>';

                try {
                    const item = await getRandomItem();
                    if (item) {
                        navigateToItem(item);
                    }
                } finally {
                    randomButton.disabled = false;
                    randomButton.innerHTML = `<i class="material-icons">casino</i>`;
                }
            });

            buttonContainer.appendChild(randomButton);
            const headerRight = document.querySelector('.headerRight');
            const searchInputContainer = document.querySelector('.searchInput');

            if (headerRight) {
                headerRight.prepend(buttonContainer);
            } else if (searchInputContainer) {
                searchInputContainer.parentNode.insertBefore(buttonContainer, searchInputContainer.nextSibling);
            }
        }
    };

    const waitForApiClient = () => {
        if (typeof ApiClient !== 'undefined' && typeof ApiClient.getCurrentUserId === 'function' && typeof ApiClient.ajax === 'function') {
            injectRandomButtonStyles();
            const observer = new MutationObserver(() => {
                addRandomButton();
            });
            observer.observe(document.body, { childList: true, subtree: true });
            addRandomButton();
        } else {
            setTimeout(waitForApiClient, 200);
        }
    };

    const injectCustomStyles = () => {
        waitForApiClient();
    };

    injectCustomStyles();

    /* ------------ Helpers ------------ */
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

    /* ------------ Enhanced Subtitle Styling ------------ */
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

        for (const rule of sheet.cssRules) {
            if (selectors.includes(rule.selectorText)) {
                rule.style.setProperty('background-color', bgColor, 'important');
                rule.style.setProperty('color', textColor, 'important');
                rule.style.setProperty('font-size', `${fontSize}em`, 'important');
                rule.style.setProperty('font-family', fontFamily, 'important');
                ruleFound = true;
            }
        }

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

    /* ------------ Settings Persistence ------------ */
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
                selectedFontFamilyPresetIndex: 0,
                randomButtonEnabled: true,
                randomIncludeMovies: true,
                randomIncludeShows: true
            };
        } catch (e) {
            console.error('Error loading settings:', e);
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

    /* ------------ Apply Saved Styles ------------ */
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

    /* ------------ Enhanced Observers ------------ */
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
            attributes: false
        });

        document.addEventListener('fullscreenchange', () => {
            setTimeout(() => {
                if (!isApplyingStyles) {
                    applySavedStylesWhenReady();
                }
            }, 200);
        });
    };

    setupStyleObserver();
    applySavedStylesWhenReady();

    /* ------------ Video Control Functions ------------ */
    const getVideo = () => document.querySelector('video');

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
        toast(`📐 Aspect Ratio: ${next?.textContent.trim()}`);
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
                    document.addEventListener('keydown', hotkeyListener);
                }
            }, 15000);
        };

        const handleMouseDown = (e) => {
            if (e.target.closest('.preset-box') || e.target.closest('button') || e.target.closest('a') || e.target.closest('details') || e.target.closest('input')) return;
            isDragging = true;
            offset = {
                x: e.clientX - help.getBoundingClientRect().left,
                y: e.clientY - help.getBoundingClientRect().top
            };
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

        help.addEventListener('mouseenter', () => {
            isMouseInside = true;
            if (autoCloseTimer) clearTimeout(autoCloseTimer);
        });

        help.addEventListener('mouseleave', () => {
            isMouseInside = false;
            resetAutoCloseTimer();
        });

        help.addEventListener('click', () => {
            resetAutoCloseTimer();
        });

        help.addEventListener('wheel', (e) => {
            e.stopPropagation();
            resetAutoCloseTimer();
        });

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
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px; text-align: center; background: linear-gradient(135deg, #AA5CC3, #00A4DC); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    🪼 Jellyfin Enhanced
                </div>
                <div style="text-align: center; font-size: 12px; color: rgba(255,255,255,0.6);">
                    Version ${SCRIPT_VERSION}
                </div>
            </div>
            <div style="display: flex; flex-direction: column; height: calc(90vh - 180px);">
                <div style="
                    padding: 20px 20px;
                    flex: 1;
                    overflow-y: auto;
                    background: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.05) 95%, rgba(255,255,255,0.1) 100%);
                    position: relative;
                ">
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
                    <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #00A4DC;">Global</h3>
                    <div style="display: grid; gap: 8px; font-size: 14px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">/</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Open search</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">Shift + H</kbd></span>
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
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">R</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Play Random Item</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Hold <kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">Shift + B</kbd> 3 sec</span>
                            <span style="color: rgba(255,255,255,0.8);">Clear all Bookmarks</span>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 12px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #00A4DC;">Video Player</h3>
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
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">B</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Bookmark current time</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span><kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 12px;">Shift + B</kbd></span>
                            <span style="color: rgba(255,255,255,0.8);">Go to Saved Bookmark</span>
                        </div>
                    </div>
                </div>

                <details style="margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(0,0,0,0.2);">
                    <summary style="padding: 16px; font-weight: 600; color: #00A4DC; cursor: pointer; user-select: none;">
                        ⏯️ Auto-Pause Settings
                    </summary>
                    <div style="padding: 0 16px 16px 16px;">
                        <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 3px solid #AA5CC3;">
                            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                                <input type="checkbox" id="autoPauseToggle" ${currentSettings.autoPauseEnabled ? 'checked' : ''} style="
                                    width: 18px;
                                    height: 18px;
                                    accent-color: #AA5CC3;
                                    cursor: pointer;
                                ">
                                <div>
                                    <div style="font-size: 14px; font-weight: 500; color: #fff;">Auto-pause</div>
                                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 2px;">Automatically pause video when switching tabs</div>
                                </div>
                            </label>
                        </div>
                        <div style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 3px solid #AA5CC3;">
                            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                                <input type="checkbox" id="autoResumeToggle" ${currentSettings.autoResumeEnabled ? 'checked' : ''} style="
                                    width: 18px;
                                    height: 18px;
                                    accent-color: #AA5CC3;
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
                    <summary style="padding: 16px; font-weight: 600; color: #00A4DC; cursor: pointer; user-select: none;">
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
                <details style="margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(0,0,0,0.2);">
                    <summary style="padding: 16px; font-weight: 600; color: #00A4DC; cursor: pointer; user-select: none;">
                        🎲 Random Button Settings
                    </summary>
                    <div style="padding: 0 16px 16px 16px;">
                        <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 3px solid #AA5CC3;">
                            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                                <input type="checkbox" id="randomButtonToggle" ${currentSettings.randomButtonEnabled ? 'checked' : ''} style="
                                    width: 18px;
                                    height: 18px;
                                    accent-color: #AA5CC3;
                                    cursor: pointer;
                                ">
                                <div>
                                    <div style="font-size: 14px; font-weight: 500; color: #fff;">Enable Random Button</div>
                                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 2px;">Show random item button in header</div>
                                </div>
                            </label>
                        <br>
                            <div style="font-size: 14px; font-weight: 500; color: #fff; margin-bottom: 8px;">Item Types (atleast one should be selected)</div>
                            <div style="display: flex; gap: 16px;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="randomIncludeMovies" ${currentSettings.randomIncludeMovies ? 'checked' : ''} style="
                                        width: 18px;
                                        height: 18px;
                                        accent-color: #AA5CC3;
                                        cursor: pointer;
                                    ">
                                    <span style="font-size: 14px; color: rgba(255,255,255,0.8);">Movies</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="randomIncludeShows" ${currentSettings.randomIncludeShows ? 'checked' : ''} style="
                                        width: 18px;
                                        height: 18px;
                                        accent-color: #bc6bffff;
                                        cursor: pointer;
                                    ">
                                    <span style="font-size: 14px; color: rgba(255,255,255,0.8);">Shows</span>
                                </label>
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
                        background: ${updateAvailable ? 'linear-gradient(135deg, #1a5f1a, #2d8f2d)' : 'linear-gradient(135deg, #AA5CC3, #00A4DC)'};
                        color: white;
                        border: 1px solid ${updateAvailable ? '#4ade80' : '#00A4DC'};
                        padding: 4px 8px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    " onmouseover="this.style.background='${updateAvailable ? 'linear-gradient(135deg, #2d8f2d, #4ade80)' : 'linear-gradient(135deg, #AA5CC3, #00A4DC)'}'"
                       onmouseout="this.style.background='${updateAvailable ? 'linear-gradient(135deg, #1a5f1a, #2d8f2d)' : 'linear-gradient(135deg, #AA5CC3, #00A4DC)'}'">
                        ${updateAvailable ? '📦 Update Available' : '🔄️ Check Updates'}
                    </button>
                    <a href="https://github.com/n00bcodr/Jellyfin-Enhanced" target="_blank" style="
                        color: #00A4DC;
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
            " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">×</button>
        `;

        document.body.appendChild(help);
        resetAutoCloseTimer();

        const autoPauseToggle = document.getElementById('autoPauseToggle');
        const autoResumeToggle = document.getElementById('autoResumeToggle');
        const randomButtonToggle = document.getElementById('randomButtonToggle');
        const randomIncludeMovies = document.getElementById('randomIncludeMovies');
        const randomIncludeShows = document.getElementById('randomIncludeShows');

        autoPauseToggle.addEventListener('change', (e) => {
            currentSettings.autoPauseEnabled = e.target.checked;
            saveSettings(currentSettings);
            toast(`⏸️ Auto-Pause ${e.target.checked ? 'Enabled' : 'Disabled'}`);
            resetAutoCloseTimer();
        });

        autoResumeToggle.addEventListener('change', (e) => {
            currentSettings.autoResumeEnabled = e.target.checked;
            saveSettings(currentSettings);
            toast(`▶️ Auto-Resume ${e.target.checked ? 'Enabled' : 'Disabled'}`);
            resetAutoCloseTimer();
        });

        randomButtonToggle.addEventListener('change', (e) => {
            currentSettings.randomButtonEnabled = e.target.checked;
            saveSettings(currentSettings);
            toast(`🎲 Random Button ${e.target.checked ? 'Enabled ✅' : 'Disabled ❌'}`);
            if (e.target.checked) {
                addRandomButton();
            } else {
                const buttonContainer = document.getElementById('randomItemButtonContainer');
                if (buttonContainer) buttonContainer.remove();
            }
            resetAutoCloseTimer();
        });
        randomIncludeMovies.addEventListener('change', (e) => {
            // Check if the user is trying to uncheck the last item
            if (!e.target.checked && !randomIncludeShows.checked) {
                e.target.checked = true; // Re-check the box immediately
                toast('⚠️ At least one item type must be selected', 5000);
                return; // Stop the function here
            }

            // If the check above passes, proceed as normal
            currentSettings.randomIncludeMovies = e.target.checked;
            saveSettings(currentSettings);
            toast(`🎬 Movies ${e.target.checked ? 'included in' : 'excluded from'} random selection`);
            resetAutoCloseTimer();
        });
        randomIncludeShows.addEventListener('change', (e) => {
            // Check if the user is trying to uncheck the last item
            if (!e.target.checked && !randomIncludeMovies.checked) {
                e.target.checked = true; // Re-check the box immediately
                toast('⚠️ At least one item type must be selected', 5000);
                return; // Stop the function here
            }
            // If the check above passes, proceed as normal
            currentSettings.randomIncludeShows = e.target.checked;
            saveSettings(currentSettings);
            toast(`🍿 Shows ${e.target.checked ? 'included in' : 'excluded from'} random selection`);
            resetAutoCloseTimer();
        });
        // randomIncludeMovies.addEventListener('change', (e) => {
        //     currentSettings.randomIncludeMovies = e.target.checked;
        //     if (!currentSettings.randomIncludeMovies && !currentSettings.randomIncludeShows) {
        //         currentSettings.randomIncludeMovies = true;
        //         randomIncludeMovies.checked = true;
        //         toast('⚠️ At least one item type must be selected', 5000);
        //         return;
        //     }
        //     saveSettings(currentSettings);
        //     toast(`🎬 Movies ${e.target.checked ? 'included in' : 'excluded from'} random selection`);
        //     resetAutoCloseTimer();
        // });

        // randomIncludeShows.addEventListener('change', (e) => {
        //     currentSettings.randomIncludeShows = e.target.checked;
        //     if (!currentSettings.randomIncludeMovies && !currentSettings.randomIncludeShows) {
        //         currentSettings.randomIncludeShows = true;
        //         randomIncludeShows.checked = true;
        //         toast('⚠️ At least one item type must be selected', 5000);
        //         return;
        //     }
        //     saveSettings(currentSettings);
        //     toast(`🍿 Shows ${e.target.checked ? 'included in' : 'excluded from'} random selection`);
        //     resetAutoCloseTimer();
        // });

        const checkUpdatesBtn = document.getElementById('checkUpdatesBtn');
        checkUpdatesBtn.addEventListener('click', () => {
            if (updateAvailable && latestReleaseData) {
                showUpdateNotification(latestReleaseData);
            } else {
                checkForUpdates(true);
            }
            resetAutoCloseTimer();
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
                resetAutoCloseTimer();
            });
        });

        const closeHelp = (ev) => {
            if ((ev.type === 'keydown' && (ev.key === 'Escape' || ev.key === '?' || (ev.shiftKey && ev.key === '/'))) ||
                (ev.type === 'click' && ev.target.id === 'closeSettingsPanel')) {
                if (autoCloseTimer) clearTimeout(autoCloseTimer);
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
                    presetBox.style.border = '2px solid #00A4DC';
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
                activeBox.style.border = '2px solid #00A4DC';
            }
        };

        setupPresetHandlers('subtitle-style-presets-container', subtitlePresets, 'style');
        setupPresetHandlers('font-size-presets-container', fontSizePresets, 'font-size');
        setupPresetHandlers('font-family-presets-container', fontFamilyPresets, 'font-family');
    };

    /* ------------ Enhanced Hotkeys ------------ */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'B' && e.shiftKey && !isVideoPage()) {
            if (!shiftBTimer && !shiftBTriggered) {
                shiftBTimer = setTimeout(() => {
                    // Double-check to prevent race conditions
                    if (!shiftBTriggered) {
                        localStorage.removeItem('jellyfinEnhancedBookmarks');
                        toast('🗑️ All Bookmarks Cleared');
                        shiftBTriggered = true;
                    }
                }, 3000);
            }
        }
    });


    // Video page specific hotkeys
    document.addEventListener('keyup', (e) => {
        if (e.key === 'B') {
            if (shiftBTimer) {
                clearTimeout(shiftBTimer);
                shiftBTimer = null;
            }
            // Reset the triggered flag after a short delay
            setTimeout(() => {
                shiftBTriggered = false;
            }, 100);
        }
    });

    // Global Hotkey Listener
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

        if (e.key === 'H' && e.shiftKey) {
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

        if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            if (!currentSettings.randomButtonEnabled) {
                toast('❌ Random Button is Disabled');
                return;
            }
            if (!currentSettings.randomIncludeMovies && !currentSettings.randomIncludeShows) {
                toast('❌ No item types selected in random button settings');
                return;
            }
            getRandomItem().then(item => {
                if (item) navigateToItem(item);
            });
            return;
        }

        if (!isVideoPage()) return;

        // b to bookmark current time
        if (e.key.toLowerCase() === 'b' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            const video = getVideo();
            if (!video) return;
            const videoId = document.title?.replace(/^Playing:\s*/, '').trim() || 'unknown';
            console.log('[JF Enhanced - Bookmark] videoId =', videoId);
            const bookmarks = JSON.parse(localStorage.getItem('jellyfinEnhancedBookmarks') || '{}');
            bookmarks[videoId] = video.currentTime;
            localStorage.setItem('jellyfinEnhancedBookmarks', JSON.stringify(bookmarks));
            const h = Math.floor(video.currentTime / 3600);
            const m = Math.floor((video.currentTime % 3600) / 60);
            const s = Math.floor(video.currentTime % 60);
            toast(`📍 Bookmarked at ${h > 0 ? `${h}:` : ''}${m.toString().padStart(h > 0 ? 2 : 1, '0')}:${s.toString().padStart(2, '0')}`);
        }
        //Shift + b or capital B for returning to bookmark
        if (e.key === 'B') {
            e.preventDefault();
            const video = getVideo();
            if (!video) return;
            const videoId = document.title?.replace(/^Playing:\s*/, '').trim() || 'unknown';
            console.log('[JF Enhanced - Bookmark] videoId =', videoId);
            const bookmarks = JSON.parse(localStorage.getItem('jellyfinEnhancedBookmarks') || '{}');
            const bookmarkTime = bookmarks[videoId];
            if (bookmarkTime !== undefined) {
                video.currentTime = bookmarkTime;
                const h = Math.floor(bookmarkTime / 3600);
                const m = Math.floor((bookmarkTime % 3600) / 60);
                const s = Math.floor(bookmarkTime % 60);
                toast(`📍 Returned to bookmark at ${h > 0 ? `${h}:` : ''}${m.toString().padStart(h > 0 ? 2 : 1, '0')}:${s.toString().padStart(2, '0')}`);
            } else {
                toast('❌ No Bookmarks Found!');
            }
        }

        // Only run video hotkeys if on a video page
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
                if (document.querySelector('.actionSheetContent')) {
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

    /* ------------ Enhanced Auto-Pause/Resume ------------ */
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