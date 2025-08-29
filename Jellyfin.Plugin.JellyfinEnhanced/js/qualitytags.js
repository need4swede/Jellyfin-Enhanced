// /js/qualitytags.js
// Jellyfin Quality Tags
// This is a modified version of the Jellyfin Quality Tags script by by BobHasNoSoul. - https://github.com/BobHasNoSoul/Jellyfin-Qualitytags/

(function (JE) {
    'use strict';

    JE.initializeQualityTags = function() {
        // Only run if the feature is enabled in the user's settings
        if (!JE.currentSettings.qualityTagsEnabled) {
            console.log('🪼 Jellyfin Enhanced: Quality Tags are disabled.');
            return;
        }

        const overlayClass = 'quality-overlay-label';
        const CACHE_VERSION = 'v10';
        const CACHE_KEY = `qualityOverlayCache-${CACHE_VERSION}`;

        const IGNORE_SELECTORS = [
            'html.preload.layout-desktop body.force-scroll.libraryDocument div#reactRoot div.mainAnimatedPages.skinBody div#itemDetailPage.page.libraryPage.itemDetailPage.noSecondaryNavPage.selfBackdropPage.mainAnimatedPage div.detailPageWrapperContainer div.detailPageSecondaryContainer.padded-bottom-page div.detailPageContent div#castCollapsible.verticalSection.detailVerticalSection.emby-scroller-container a.cardImageContainer',
            'html.preload.layout-desktop body.force-scroll.libraryDocument.withSectionTabs.mouseIdle div#reactRoot div.mainAnimatedPages.skinBody div#indexPage.page.homePage.libraryPage.allLibraryPage.backdropPage.pageWithAbsoluteTabs.withTabs.mainAnimatedPage div#homeTab.tabContent.pageTabContent.is-active div.sections.homeSectionsContainer div.verticalSection.MyMedia.emby-scroller-container a.cardImageContainer'
        ];

        const MEDIA_TYPES = new Set(['Movie', 'Episode', 'Series', 'Season']);

        let qualityOverlayCache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
        let seenItems = new Set();
        let pendingRequests = new Set();
        let errorCount = 0;
        let currentDelay = 1000;

        const qualityColors = {
            '4K': 'rgba(189, 5, 232, 0.9)',
            '1080p': 'rgba(0, 204, 204, 0.85)',
            '720p': 'rgba(255, 165, 0, 0.85)',
            'SD': 'rgba(150, 150, 150, 0.85)',
            'HDR': 'rgba(255, 215, 0, 0.9)',
            'DTS': 'rgba(255, 100, 0, 0.9)',
            'DOLBY': 'rgba(0, 100, 255, 0.9)'
        };

        const config = {
            MAX_CONCURRENT_REQUESTS: 9,
            BASE_DELAY: 1000,
            MAX_DELAY: 10000,
            VISIBLE_PRIORITY_DELAY: 200,
            CACHE_TTL: 7 * 24 * 60 * 60 * 1000,
            REQUEST_TIMEOUT: 5000
        };

        const visibilityObserver = new IntersectionObserver(handleIntersection, {
            rootMargin: '300px',
            threshold: 0.01
        });

        let currentUrl = window.location.href;
        let navigationHandlerSetup = false;

        function getUserId() {
            try {
                return (window.ApiClient?._serverInfo?.UserId) || null;
            } catch {
                return null;
            }
        }

        function saveCache() {
            try {
                const now = Date.now();
                for (const [key, entry] of Object.entries(qualityOverlayCache)) {
                    if (now - entry.timestamp > config.CACHE_TTL) {
                        delete qualityOverlayCache[key];
                    }
                }
                localStorage.setItem(CACHE_KEY, JSON.stringify(qualityOverlayCache));
            } catch (e) {
                console.warn('Failed to save cache', e);
            }
        }

        function createLabel(label) {
            const badge = document.createElement('div');
            badge.textContent = label;
            badge.className = overlayClass;
            badge.style.background = qualityColors[label] || 'rgba(150, 150, 150, 0.85)';
            badge.style.position = 'absolute';
            badge.style.top = '8px';
            badge.style.right = '8px';
            badge.style.color = 'white';
            badge.style.padding = '2px 12px';
            badge.style.fontSize = '1.1em';
            badge.style.fontWeight = 'bold';
            badge.style.borderRadius = '4px';
            badge.style.zIndex = '99';
            badge.style.pointerEvents = 'none';
            badge.style.userSelect = 'none';
            badge.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
            return badge;
        }

        function getQuality(mediaStream) {
            if (!mediaStream) return [];
            const qualities = [];
            const height = mediaStream.Height || 0;
            const videoRange = mediaStream.VideoRange || '';
            const audioCodec = mediaStream.Codec || '';

            if (height >= 2160) qualities.push('4K');
            else if (height >= 1080) qualities.push('1080p');
            else if (height >= 720) qualities.push('720p');
            else if (height > 0) qualities.push('SD');

            if (videoRange.toLowerCase() === 'hdr') qualities.push('HDR');
            if (audioCodec.toLowerCase().includes('dts')) qualities.push('DTS');
            if (audioCodec.toLowerCase().includes('dolby') || audioCodec.toLowerCase().includes('truehd')) qualities.push('DOLBY');

            return qualities;
        }

        async function fetchFirstEpisode(userId, seriesId) {
            try {
                const episodeResponse = await ApiClient.ajax({
                    type: "GET",
                    url: ApiClient.getUrl("/Items", {
                        ParentId: seriesId,
                        IncludeItemTypes: "Episode",
                        Recursive: true,
                        SortBy: "PremiereDate",
                        SortOrder: "Ascending",
                        Limit: 1,
                        userId: userId
                    }),
                    dataType: "json"
                });
                return episodeResponse.Items?.[0] || null;
            } catch {
                return null;
            }
        }

        async function fetchItemQuality(userId, itemId) {
            if (pendingRequests.has(itemId)) return null;
            pendingRequests.add(itemId);

            try {
                const item = await ApiClient.getItem(userId, itemId);
                if (!item || !MEDIA_TYPES.has(item.Type)) return null;

                let qualities = [];

                if (item.Type === "Series" || item.Type === "Season") {
                    const ep = await fetchFirstEpisode(userId, item.Id);
                    if (ep?.Id) {
                        const fullEp = await ApiClient.getItem(userId, ep.Id);
                        const videoStream = fullEp?.MediaSources?.[0]?.MediaStreams?.find(s => s.Type === 'Video');
                        const audioStream = fullEp?.MediaSources?.[0]?.MediaStreams?.find(s => s.Type === 'Audio');
                        qualities = [...getQuality(videoStream), ...getQuality(audioStream)];
                    }
                } else {
                    const videoStream = item?.MediaSources?.[0]?.MediaStreams?.find(s => s.Type === 'Video');
                    const audioStream = item?.MediaSources?.[0]?.MediaStreams?.find(s => s.Type === 'Audio');
                    qualities = [...getQuality(videoStream), ...getQuality(audioStream)];
                }

                const uniqueQualities = [...new Set(qualities)];
                if (uniqueQualities.length > 0) {
                    qualityOverlayCache[itemId] = {
                        qualities: uniqueQualities,
                        timestamp: Date.now()
                    };
                    saveCache();
                    return uniqueQualities;
                }
                return null;
            } catch {
                handleApiError();
                return null;
            } finally {
                pendingRequests.delete(itemId);
            }
        }

        function handleApiError() {
            errorCount++;
            currentDelay = Math.min(
                config.MAX_DELAY,
                config.BASE_DELAY * Math.pow(2, Math.min(errorCount, 5)) * (0.8 + Math.random() * 0.4)
            );
        }

        function insertOverlay(container, qualities) {
            if (!container || container.querySelector(`.${overlayClass}`)) return;
            if (getComputedStyle(container).position === 'static') container.style.position = 'relative';

            const qualityContainer = document.createElement('div');
            qualityContainer.style.position = 'absolute';
            qualityContainer.style.top = '8px';
            qualityContainer.style.left = '8px';
            qualityContainer.style.display = 'flex';
            qualityContainer.style.flexDirection = 'column';
            qualityContainer.style.gap = '4px';
            qualityContainer.style.alignItems = 'flex-start';
            qualityContainer.style.zIndex = '100';

            qualities.forEach(quality => {
                const label = createLabel(quality);
                label.style.position = 'static';
                qualityContainer.appendChild(label);
            });

            container.appendChild(qualityContainer);
        }

        function getItemIdFromElement(el) {
            if (el.href) {
                const match = el.href.match(/id=([a-f0-9]{32})/i);
                if (match) return match[1];
            }
            if (el.style.backgroundImage) {
                const match = el.style.backgroundImage.match(/\/Items\/([a-f0-9]{32})\//i);
                if (match) return match[1];
            }
            return null;
        }

        function shouldIgnoreElement(el) {
            return IGNORE_SELECTORS.some(selector => el.closest(selector) !== null);
        }

        async function processElement(el, isPriority = false) {
            if (shouldIgnoreElement(el)) return;

            const itemId = getItemIdFromElement(el);
            if (!itemId || seenItems.has(itemId)) return;
            seenItems.add(itemId);

            const cached = qualityOverlayCache[itemId];
            if (cached) {
                insertOverlay(el, cached.qualities);
                return;
            }

            const userId = getUserId();
            if (!userId) return;

            const delay = isPriority ?
                Math.min(config.VISIBLE_PRIORITY_DELAY, currentDelay) :
                currentDelay;

            await new Promise(resolve => setTimeout(resolve, delay));

            if (qualityOverlayCache[itemId]) {
                insertOverlay(el, qualityOverlayCache[itemId].qualities);
                return;
            }

            const qualities = await fetchItemQuality(userId, itemId);
            if (qualities) insertOverlay(el, qualities);
        }

        function isElementVisible(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight + 300) &&
                rect.bottom >= -300 &&
                rect.left <= (window.innerWidth + 300) &&
                rect.right >= -300
            );
        }

        function handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    visibilityObserver.unobserve(el);
                    processElement(el, true);
                }
            });
        }

        function renderVisibleTags() {
            const elements = Array.from(document.querySelectorAll('a.cardImageContainer, div.listItemImage'));

            elements.forEach(el => {
                if (shouldIgnoreElement(el)) return;

                const itemId = getItemIdFromElement(el);
                if (!itemId) return;

                const cached = qualityOverlayCache[itemId];
                if (cached) {
                    insertOverlay(el, cached.qualities);
                    return;
                }

                if (isElementVisible(el)) {
                    processElement(el, true);
                } else {
                    visibilityObserver.observe(el);
                }
            });
        }

        function hookIntoHistoryChanges(callback) {
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;

            history.pushState = function (...args) {
                originalPushState.apply(this, args);
                callback();
            };

            history.replaceState = function (...args) {
                originalReplaceState.apply(this, args);
                callback();
            };

            window.addEventListener('popstate', callback);
        }

        function setupNavigationHandlers() {
            if (navigationHandlerSetup) return;
            navigationHandlerSetup = true;

            document.addEventListener('click', (e) => {
                const backButton = e.target.closest('button.headerButtonLeft:nth-child(1) > span:nth-child(1)');
                if (backButton) {
                    setTimeout(() => {
                        seenItems.clear();
                        renderVisibleTags();
                    }, 500);
                }
            });

            hookIntoHistoryChanges(() => {
                currentUrl = window.location.href;
                seenItems.clear();
                visibilityObserver.disconnect();
                setTimeout(renderVisibleTags, 300);
            });
        }

        function addStyles() {
            if (document.getElementById('quality-tag-style')) return;
            const style = document.createElement('style');
            style.id = 'quality-tag-style';
            style.textContent = `
                .${overlayClass} {
                    user-select: none;
                    pointer-events: none;
                }
            `;
            document.head.appendChild(style);
        }

        addStyles();

        setTimeout(() => {
            setupNavigationHandlers();
            renderVisibleTags();
        }, 1500);

        window.addEventListener('beforeunload', saveCache);
        setInterval(saveCache, 60000);

        const mutationObserver = new MutationObserver((mutations) => {
            if (mutations.some(m => m.addedNodes.length > 0)) {
                setTimeout(renderVisibleTags, 1000);
            }
        });
        mutationObserver.observe(document.body, { childList: true, subtree: true });

        async function fetchWithTimeout(url, timeout = config.REQUEST_TIMEOUT) {
            return Promise.race([
                fetch(url),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
            ]);
        }

        console.log('🪼 Jellyfin Enhanced: Quality Tags initialized.');
    };

})(window.JellyfinEnhanced);