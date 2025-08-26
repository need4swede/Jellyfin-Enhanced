// /js/jellyseerr.js
(function(JE) {
    'use strict';

        /**
         * Initializes the Jellyseerr search integration feature.
         */
        JE.initializeJellyseerrScript = function() {
        const logPrefix = '🪼 Jellyfin Enhanced: Jellyseerr Search:';
        if (!JE.pluginConfig.JellyseerrEnabled) {
            console.log(`${logPrefix} Integration is disabled in plugin settings.`);
            return;
        }

        console.log(`${logPrefix} Initializing....`);

        let lastProcessedQuery = null;
        let debounceTimeout = null;
        let isJellyseerrActive = false;
        let jellyseerrUserFound = false;

        // STYLES
        function addStyles() {
            const styleId = 'jellyseerr-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #jellyseerr-search-icon{
                position:absolute;right:10px;top:68%;transform:translateY(-50%);
                user-select:none;z-index:10;transition:filter .2s,opacity .2s;
                }
                .inputContainer{position:relative!important;}
                .jellyseerr-icon{width:30px;height:50px;filter:drop-shadow(2px 2px 6px #000);}
                .cardIndicators .jellyseerr-icon{margin:1em 1em 0 0;}
                #jellyseerr-search-icon.is-active{filter:drop-shadow(2px 2px 6px #000);opacity:1;}
                #jellyseerr-search-icon.is-disabled{filter:hue-rotate(125deg) brightness(100%);}
                #jellyseerr-search-icon.is-no-user{filter:grayscale(1);opacity:.8;}

                .jellyseerr-section{margin-bottom:2em;}

                .jellyseerr-request-button{
                margin-top:.5em!important;width:100%;display:flex;justify-content:center;align-items:center;white-space:nowrap;
                transition:background .2s,border-color .2s,color .2s;
                }
                .jellyseerr-request-button.jellyseerr-button-offline,.jellyseerr-request-button.jellyseerr-button-no-user{opacity:.6;cursor:not-allowed;}
                .jellyseerr-request-button.jellyseerr-button-requested{background-color:#5a6268!important;color:#fff!important;}
                .jellyseerr-request-button.jellyseerr-button-pending{background-color:#b45309!important;color:#fff!important;}
                .jellyseerr-request-button.jellyseerr-button-processing{background-color:#581c87!important;color:#fff!important;}
                .jellyseerr-request-button.jellyseerr-button-rejected{background-color:#8a1c1c!important;color:#fff!important;}
                .jellyseerr-request-button.jellyseerr-button-partially-available{background-color:#4ca46c!important;color:#fff!important;}
                .jellyseerr-request-button.jellyseerr-button-available{background-color:#16a34a!important;color:#fff!important;}
                .jellyseerr-request-button.jellyseerr-button-error{background:#dc3545!important;color:#fff!important;}

                .jellyseerr-spinner,.jellyseerr-loading-spinner,.jellyseerr-button-spinner{
                display:inline-block;border-radius:50%;animation:jellyseerr-spin 1s linear infinite;
                }
                .jellyseerr-loading-spinner{width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;margin-left:10px;vertical-align:middle;}
                .jellyseerr-button-spinner{width:1em;height:1em;border:2px solid currentColor;border-right-color:transparent;margin-left:.5em;flex-shrink:0;}

                @keyframes jellyseerr-spin{to{transform:rotate(360deg)}}

                .jellyseerr-meta{display:flex;justify-content:center;align-items:center;gap:1.5em;padding:0 .75em;}
                .jellyseerr-rating{display:flex;align-items:center;gap:.3em;color:#bdbdbd;}
                .jellyseerr-rating .material-icons{font-size:1.2em;color:#ffc107;}
                .cardText-first > a[is="emby-linkbutton"] { padding: 0 !important; margin: 0 !important; }
            `;
            document.head.appendChild(style);
        }

        //helper for container
        async function checkJellyseerrStatus() {
            try {
                const res = await ApiClient.ajax({
                    type: 'GET',
                    url: ApiClient.getUrl('/JellyfinEnhanced/jellyseerr/user-status'),
                    headers: { 'X-Jellyfin-User-Id': ApiClient.getCurrentUserId() },
                    dataType: 'json'
                });
                isJellyseerrActive = !!res.active;
                jellyseerrUserFound = !!res.userFound;
                if (isJellyseerrActive && !jellyseerrUserFound) {
                    console.warn(`${logPrefix} Connection successful, but the current Jellyfin user is not linked to a Jellyseerr account.`);
                }
            } catch (e) {
                const userId = ApiClient.getCurrentUserId();
                console.warn(`${logPrefix} Status check failed for user ${userId}:`, e);
                isJellyseerrActive = false;
                jellyseerrUserFound = false;
            }
            updateJellyseerrIcon();
        }

        // UI Injection
        function updateJellyseerrIcon() {
            const anchor = document.querySelector('.searchFields .inputContainer')
                    || document.querySelector('#searchPage .searchFields')
                    || document.querySelector('#searchPage');
            if (!anchor) return;

            let icon = document.getElementById('jellyseerr-search-icon');
            if (!icon) {
                icon = document.createElement('img');
                icon.id = 'jellyseerr-search-icon';
                icon.className = 'jellyseerr-icon';
                icon.src = 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/jellyseerr.svg';
                icon.alt = 'Jellyseerr';
                anchor.appendChild(icon);
            }

            icon.classList.remove('is-active','is-disabled','is-no-user');

            if (isJellyseerrActive && jellyseerrUserFound) {
                icon.title = 'Jellyseerr is active';
                icon.classList.add('is-active');
            } else if (isJellyseerrActive && !jellyseerrUserFound) {
                icon.title = 'Jellyseerr ID not found';
                icon.classList.add('is-no-user');
            } else {
                icon.title = 'Jellyseerr is not connected.';
                icon.classList.add('is-disabled');
            }
        }

        function initializeObserver() {
            const observer = new MutationObserver(() => {
                updateJellyseerrIcon();
                const isSearchPage = window.location.hash.includes('/search.html');
                const currentQuery = isSearchPage ? new URLSearchParams(window.location.hash.split('?')[1]).get('query') : null;

                if (isSearchPage && currentQuery && currentQuery.trim() !== '') {
                    clearTimeout(debounceTimeout);
                    debounceTimeout = setTimeout(() => {
                        if (!isJellyseerrActive) {
                            document.querySelectorAll('.jellyseerr-section').forEach(e => e.remove());
                            return;
                        }
                        const latestQuery = new URLSearchParams(window.location.hash.split('?')[1]).get('query');
                        if (latestQuery === lastProcessedQuery) return;
                        lastProcessedQuery = latestQuery;
                        document.querySelectorAll('.jellyseerr-section').forEach(e => e.remove());
                        runJellyseerrSearch(latestQuery);
                    }, 1000);
                } else {
                    // If not on search page, or query is empty, clear results and reset state
                    clearTimeout(debounceTimeout);
                    lastProcessedQuery = null;
                    document.querySelectorAll('.jellyseerr-section').forEach(e => e.remove());
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // API - Fetch search results
        async function fetchFromJellyseerr(query) {
            const requestUrl = ApiClient.getUrl(`/JellyfinEnhanced/jellyseerr/search?query=${encodeURIComponent(query)}`);

            try {
                const data = await ApiClient.ajax({
                    type: 'GET',
                    url: requestUrl,
                    dataType: 'json',
                    headers: { 'X-Jellyfin-User-Id': ApiClient.getCurrentUserId() }
                });

                if (data.results && data.results.length > 0) {
                    const jellyseerrSection = createJellyseerrSection(false, data.results);
                    renderJellyseerrResults(jellyseerrSection, query);
                } else {
                    console.debug(`${logPrefix} No results found.`);
                }
            } catch (error) {
                const userId = ApiClient.getCurrentUserId();
                console.error(`${logPrefix} Error fetching search results for user ${userId}:`, error);
            }
        }

        async function requestMedia(tmdbId, mediaType, button) {
            button.disabled = true;
            button.innerHTML = `<span>Requesting</span><span class="jellyseerr-button-spinner"></span>`;

            const requestBody = { mediaType, mediaId: parseInt(tmdbId) };
            if (mediaType === 'tv') requestBody.seasons = "all";

            try {
                await ApiClient.ajax({
                    type: 'POST',
                    url: ApiClient.getUrl('/JellyfinEnhanced/jellyseerr/request'),
                    data: JSON.stringify(requestBody),
                    contentType: 'application/json',
                    headers: { 'X-Jellyfin-User-Id': ApiClient.getCurrentUserId() }
                });
                button.innerHTML = `<span>Requested <span class="material-icons" style="font-size: 1em; vertical-align: middle;">check_circle</span></span>`;
                button.classList.add('jellyseerr-button-available');
            } catch (error) {
                button.disabled = false;
                const userId = ApiClient.getCurrentUserId();
                console.error(`${logPrefix} Request Failed via proxy for user ${userId}:`, error);

                let errorMessage = 'Error';
                if (error.status === 404) {
                    errorMessage = 'User Not Found';
                } else if (error.responseJSON && error.responseJSON.message) {
                    errorMessage = error.responseJSON.message;
                }

                button.innerHTML = `<span>${errorMessage} <span class="material-icons" style="font-size: 1.2em; vertical-align: middle;">error</span></span>`;
                button.classList.add('jellyseerr-button-error');
            }
        }

        function runJellyseerrSearch(query) {
            fetchFromJellyseerr(query);
        }

        function renderJellyseerrResults(sectionToInject, query) {
            console.log(`${logPrefix} Called with query:`, query);

            const searchPage = document.querySelector('#searchPage');
            if (!searchPage) {
                console.warn(`${logPrefix} #searchPage not found. Exiting.`);
                return;
            }
            console.log(`${logPrefix} Found #searchPage`);

            // Remove any previous injection
            const oldSection = searchPage.querySelector('.jellyseerr-section');
            if (oldSection) {
                console.log(`${logPrefix} Removing old .jellyseerr-section`);
                oldSection.remove();
            }

            // Ensure our injected block is identifiable
            if (!sectionToInject.classList.contains('jellyseerr-section')) {
                sectionToInject.classList.add('jellyseerr-section');
            }

            const primaryTypes = ['movies', 'shows', 'series', 'episodes'];
            const secondaryTypes = ['people', 'artists', 'albums', 'songs', 'videos', 'collections', 'playlists'];
            const allTypes = primaryTypes.concat(secondaryTypes);

            let attempts = 0;
            const maxAttempts = 75; // ~15s @ 200ms

            console.log(`${logPrefix} Waiting for Jellyfin content to load...`);

            const injectionInterval = setInterval(() => {
                attempts++;

                const noResultsMessage = searchPage.querySelector('.noItemsMessage');
                const sections = Array.from(searchPage.querySelectorAll('.verticalSection'));
                const hasTypedSection = sections.some(s => {
                    const title = s.querySelector('.sectionTitle')?.textContent.trim().toLowerCase() || '';
                    return allTypes.some(t => title.includes(t));
                });

                // Keep waiting until we see either a typed section or an explicit "no results" message, or timeout
                if (!(hasTypedSection || noResultsMessage) && attempts < maxAttempts) {
                    return; // Keep waiting
                }

                clearInterval(injectionInterval);
                console.log(`${logPrefix} Proceeding with injection (Reason: ${noResultsMessage ? 'No Items Message' : hasTypedSection ? 'Typed Section Found' : 'Timeout'})`);

                if (noResultsMessage) {
                    console.log(`${logPrefix} Found .noItemsMessage, injecting after it.`);
                    noResultsMessage.textContent = `Sorry! No results found for "${query}" on Jellyfin`;
                    noResultsMessage.parentElement.insertBefore(sectionToInject, noResultsMessage.nextSibling);
                    return;
                }

                // We have at least one typed section → follow the primary/secondary placement rules
                const allSections = Array.from(searchPage.querySelectorAll('.verticalSection:not(.jellyseerr-section)'));
                let lastPrimarySection = null;
                for (let i = allSections.length - 1; i >= 0; i--) {
                    const title = allSections[i].querySelector('.sectionTitle')?.textContent.trim().toLowerCase() || '';
                    if (primaryTypes.some(type => title.includes(type))) {
                        lastPrimarySection = allSections[i];
                        break;
                    }
                }

                if (lastPrimarySection) {
                    console.log(`${logPrefix} Injecting after last primary section.`);
                    lastPrimarySection.parentElement.insertBefore(sectionToInject, lastPrimarySection.nextSibling);
                    return;
                }

                const firstSecondarySection = allSections.find(s => {
                    const title = s.querySelector('.sectionTitle')?.textContent.trim().toLowerCase() || '';
                    return secondaryTypes.some(type => title.includes(type));
                });

                if (firstSecondarySection) {
                    console.log(`${logPrefix} No primary found. Injecting before first secondary section.`);
                    firstSecondarySection.parentElement.insertBefore(sectionToInject, firstSecondarySection);
                    return;
                }

                // Timeout or unexpected DOM: last resort fallbacks
                console.warn(`${logPrefix} No typed sections resolved. Using fallback injection method.`);
                const resultsContainer = searchPage.querySelector('.searchResults, [class*="searchResults"], .padded-top.padded-bottom-page');
                if (resultsContainer) {
                    resultsContainer.appendChild(sectionToInject);
                } else {
                    searchPage.appendChild(sectionToInject);
                }
            }, 200);
        }



        function createJellyseerrSection(isLoading, results = []) {
            const section = document.createElement('div');
            section.className = 'verticalSection emby-scroller-container jellyseerr-section';

            const title = document.createElement('h2');
            title.className = 'sectionTitle sectionTitle-cards focuscontainer-x padded-left padded-right';
            title.textContent = 'Discover on Jellyseerr';

            if (isLoading) {
                const spinner = document.createElement('div');
                spinner.className = 'jellyseerr-loading-spinner';
                title.appendChild(spinner);
            }
            section.appendChild(title);

            const scrollerContainer = document.createElement('div');
            scrollerContainer.setAttribute('is', 'emby-scroller');
            scrollerContainer.className = 'padded-top-focusscale padded-bottom-focusscale emby-scroller';
            scrollerContainer.dataset.horizontal = "true";
            scrollerContainer.dataset.centerfocus = "card";

            const itemsContainer = document.createElement('div');
            itemsContainer.setAttribute('is', 'emby-itemscontainer');
            itemsContainer.className = 'focuscontainer-x itemsContainer scrollSlider';
            itemsContainer.style.whiteSpace = 'nowrap';

            if (!isLoading) {
                results.forEach(item => {
                    const card = createJellyseerrCard(item);
                    itemsContainer.appendChild(card);
                });
            }

            scrollerContainer.appendChild(itemsContainer);
            section.appendChild(scrollerContainer);
            return section;
        }

        function createJellyseerrCard(item) {
            const year = item.releaseDate ? item.releaseDate.substring(0, 4) : (item.firstAirDate ? item.firstAirDate.substring(0, 4) : 'N/A');
            const posterUrl = item.posterPath ? `https://image.tmdb.org/t/p/w400${item.posterPath}` : 'https://i.ibb.co/fdbkXQdP/jellyseerr-poster-not-found.png';
            const rating = item.voteAverage ? item.voteAverage.toFixed(1) : 'N/A';
            const titleText = item.title || item.name;
            const tmdbUrl = `https://www.themoviedb.org/${item.mediaType}/${item.id}`;

            const card = document.createElement('div');
            card.className = 'card overflowPortraitCard card-hoverable card-withuserdata jellyseerr-card';

            card.innerHTML = `
                <div class="cardBox cardBox-bottompadded">
                    <div class="cardScalable">
                        <div class="cardPadder cardPadder-overflowPortrait"></div>
                        <div class="cardImageContainer coveredImage cardContent itemAction" style="background-image: url('${posterUrl}');">
                            <div class="cardIndicators">
                                <div class="indicator">
                                    <img src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/jellyseerr.svg" class="jellyseerr-icon" alt="Jellyseerr"/>
                                </div>
                            </div>
                        </div>
                        <div class="cardOverlayContainer" data-action="link"></div>
                    </div>
                    <div class="cardText cardTextCentered cardText-first">
                        <a is="emby-linkbutton" href="${tmdbUrl}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;" title="View on TMDB">
                            <bdi>${titleText}</bdi>
                        </a>
                    </div>
                    <div class="cardText cardTextCentered cardText-secondary jellyseerr-meta">
                        <bdi>${year}</bdi>
                        <div class="jellyseerr-rating">
                            <span class="material-icons">star</span>
                            <span>${rating}</span>
                        </div>
                    </div>
                    <div class="cardFooter" style="padding: 0.5em 1em 1em;">
                        <button is="emby-button" type="button" class="jellyseerr-request-button emby-button" data-tmdb-id="${item.id}" data-media-type="${item.mediaType}"></button>
                    </div>
                </div>
                `;

            const button = card.querySelector('.jellyseerr-request-button');
            if (!isJellyseerrActive) {
                button.innerHTML = `<span>Jellyseerr offline</span><span class="material-icons" style="font-size: 1em; vertical-align: middle; margin-left: 0.5em;">cloud_off</span>`;
                button.disabled = true;
                button.classList.add('jellyseerr-button-offline');
                } else if (!jellyseerrUserFound) {
                button.innerHTML = `<span>User not found</span><span class="material-icons" style="font-size: 1em; vertical-align: middle; margin-left: 0.5em;">person_off</span>`;
                button.disabled = true;
                button.classList.add('jellyseerr-button-no-user');
                } else {
            const status = item.mediaInfo ? item.mediaInfo.status : 1;
            switch (status) {
                case 2: // Pending Approval
                    button.innerHTML = `<span>Pending</span><span class="material-icons" style="font-size: 1em; vertical-align: middle; margin-left: 0.5em;">pending</span>`;
                    button.disabled = true;
                    button.classList.add('button-submit', 'jellyseerr-button-pending');
                    break;
                case 3: // Processing
                    button.innerHTML = `<span>Processing</span><span class="jellyseerr-button-spinner"></span>`;
                    button.disabled = true;
                    button.classList.add('button-submit', 'jellyseerr-button-processing');
                    break;
                case 4: // Partially Available
                    button.innerHTML = `<span>Partially Available</span><span class="material-icons" style="font-size: 1em; vertical-align: middle; margin-left: 0.5em;">check_circle_outline</span>`;
                    button.disabled = true;
                    button.classList.add('button-submit', 'jellyseerr-button-partially-available');
                    break;
                case 5: // Available
                    button.innerHTML = `<span>Available</span><span class="material-icons" style="font-size: 1em; vertical-align: middle; margin-left: 0.5em;">check_circle</span>`;
                    button.disabled = true;
                    button.classList.add('button-submit', 'jellyseerr-button-available');
                    break;
                case 6: // Rejected
                    button.innerHTML = `<span>Rejected</span><span class="material-icons" style="font-size: 1em; vertical-align: middle; margin-left: 0.5em;">cancel</span>`;
                    button.disabled = true;
                    button.classList.add('button-submit', 'jellyseerr-button-rejected');
                    break;
                default:
                    button.innerHTML = `<span>Request</span><span class="material-icons" style="font-size: 1em; vertical-align: middle; margin-left: 0.5em;">add_circle</span>`;
                    button.disabled = false;
                    button.classList.add('button-submit', 'jellyseerr-button-requested');
                }
            }
            if (item.mediaType === 'movie' || item.mediaType === 'tv') {
                const imageContainer = card.querySelector('.cardImageContainer');
                if (imageContainer) {
                    const badge = document.createElement('div');
                    badge.style.cssText = `position: absolute; top: 8px; left: 8px; z-index: 100; background-color: ${item.mediaType === 'movie' ? 'rgba(59, 130, 246, .9)' : 'rgba(243, 51, 214, .9)'}; text-transform: uppercase; color: #fff; padding: 2px 8px; border-radius: 100px; border: ${item.mediaType === 'movie' ? '1px solid rgba(42, 95, 180)' : '1px solid rgba(167, 33, 147)'}; font-size: 0.9em; font-weight: 500; text-shadow: -2px 2px 5px black;`;
                    badge.textContent = item.mediaType === 'movie' ? 'Movie' : 'Series';
                    imageContainer.appendChild(badge);
                }
            }
            return card;
        }

        function waitForUserAndInitialize() {
            const startTime = Date.now();
            const timeout = 20000; // Wait up to 20 seconds for a user session

            const check = () => {
                // Check if the API client has a user ID
                if (ApiClient.getCurrentUserId()) {
                    console.log(`${logPrefix} User session found. Proceeding...`);
                    // User is available, run the status check and then set up the observer
                    checkJellyseerrStatus().then(() => {
                        initializeObserver();
                    });
                } else if (Date.now() - startTime > timeout) {
                    // If we've waited too long, give up and initialize in a degraded state
                    console.warn(`${logPrefix} Timed out waiting for user ID. Features may be limited.`);
                    checkJellyseerrStatus().then(() => {
                        initializeObserver();
                    });
                } else {
                    // If no user yet and we haven't timed out, wait and check again
                    setTimeout(check, 300);
                }
            };

            // Start the check
            check();
        }

        // --- Initialization ---
        addStyles();

        waitForUserAndInitialize();

        document.body.addEventListener('click', function(event) {
            const button = event.target.closest('.jellyseerr-request-button');
            if (button && !button.disabled) {
                requestMedia(button.dataset.tmdbId, button.dataset.mediaType, button);
            }
        });
    };
})(window.JellyfinEnhanced);