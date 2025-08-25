// /js/jellyseerr.js
(function(JE) {
    'use strict';

    /**
     * Initializes the Jellyseerr search integration feature.
     */
    JE.initializeJellyseerrScript = function() {
        if (!JE.pluginConfig.JellyseerrEnabled) {
            console.log('🪼 Jellyfin Enhanced: Jellyseerr Search: Integration is disabled in plugin settings.');
            return;
        }

        console.log('🪼 Jellyfin Enhanced: Jellyseerr Search: Initializing.');

            let lastProcessedQuery = null;
            let debounceTimeout = null;

        // STYLES
        function addStyles() {
            const styleId = 'jellyseerr-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #jellyseerr-search-icon {
                    position: absolute;
                    right: 10px;
                    top: 65%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    filter: grayscale(.9);
                    transition: opacity 0.2s, filter 0.2s;
                    user-select: none;
                    z-index: 10;
                }
                .inputContainer {
                    position: relative !important;
                }
                #jellyseerr-search-icon:hover {
                    filter: none;
                }
                #jellyseerr-search-icon.active {
                    filter: drop-shadow(0 0 3px #d8bbfd);
                }
                .searchInputContainer {
                    position: relative;
                }
                #jellyseerr-login-modal {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100000;
                }
                #jellyseerr-login-content {
                    background: #1a1a1a;
                    padding: 2em;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 400px;
                    border: 1px solid #333;
                }
                #jellyseerr-login-content h3 { margin-top: 0; color: #eee; }
                .jellyseerr-input-group { margin-bottom: 1em; }
                .jellyseerr-input-group label { display: block; margin-bottom: 0.5em; color: #ccc; }
                .jellyseerr-input-group input, .jellyseerr-input-group select {
                    width: 100%;
                    padding: 0.75em;
                    background: #2c2c2c;
                    border: 1px solid #444;
                    border-radius: 4px;
                    color: #fff;
                    box-sizing: border-box;
                }
                #jellyseerr-login-error {
                    color: #ff6b6b;
                    margin-top: 1em;
                    display: none;
                    font-size: 0.9em;
                    padding: 0.5em;
                    background: rgba(255, 107, 107, 0.1);
                    border-left: 3px solid #ff6b6b;
                    border-radius: 4px;
                }
                .jellyseerr-section { margin-bottom: 2em; }
                .jellyseerr-card { border-radius: 0.25em; overflow: hidden; display: flex; flex-direction: column; box-shadow: none !important; }
                .jellyseerr-request-button { margin-top: 0.5em !important; width: 100%; display: flex; justify-content: center; align-items: center; white-space: nowrap; }
                .jellyseerr-rating { display: flex; align-items: center; gap: 0.3em; color: #bdbdbd; }
                .jellyseerr-rating .material-icons { font-size: 1.2em; color: #ffc107; }
                .jellyseerr-icon { width: 30px; height: 50px; filter: drop-shadow(0 0 5px rgba(0,0,0,.7)); }
                .button-submit.jellyseerr-button-available { background-color: #52b54b !important; color: white !important; opacity: 1 !important; }
                .button-submit.jellyseerr-button-pending { background-color: #683ab797 !important; color: white !important; opacity: 1 !important; }
                .jellyseerr-button-pending span:first-child { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .button-submit.jellyseerr-button-requested { background-color: #673ab7 !important; color: white !important; opacity: 1 !important; }
                .button-submit.jellyseerr-button-error { background-color: #dc3545 !important; color: white !important; }
                .jellyseerr-meta { display: flex; justify-content: center; align-items: center; gap: 1.5em; padding: 0 0.75em; }
                @keyframes jellyseerr-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .jellyseerr-loading-spinner { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: #fff; animation: jellyseerr-spin 1s ease-in-out infinite; margin-left: 10px; vertical-align: middle; }
                .jellyseerr-button-spinner { width: 1em; height: 1em; flex-shrink: 0; border: 3px solid rgba(255, 255, 255, 0.3); border-top-color: #fff; border-radius: 50%; display: inline-block; margin-left: 8px; animation: jellyseerr-spin 1s linear infinite; }
            `;
            document.head.appendChild(style);
        }

        // Authentication
        const authManager = {
            key: 'jellyseerrAuthToken',
            saveToken: (token) => localStorage.setItem(authManager.key, token),
            getToken: () => localStorage.getItem(authManager.key),
            clearToken: () => localStorage.removeItem(authManager.key),
            isLoggedIn: () => !!authManager.getToken()
        };

        async function showLoginModal() {
            if (document.querySelector('.jellyseerr-dialog-container')) return;

            const currentUser = await ApiClient.getCurrentUser();
            const username = currentUser ? currentUser.Name : 'user';

            const dialogBackdrop = document.createElement('div');
            dialogBackdrop.className = 'dialogBackdrop dialogBackdropOpened';

            const dialogContainer = document.createElement('div');
            dialogContainer.className = 'dialogContainer jellyseerr-dialog-container';

            dialogContainer.innerHTML = `
                <div class="focuscontainer dialog formDialog openedfocuscontainer dialog formDialog opened" style="animation: 180ms ease-out 0s 1 normal both running scaleup;">
                    <div class="formDialogHeader">
                        <button is="paper-icon-button-light" class="btnCancel autoSize paper-icon-button-light" tabindex="-1" title="Back"> <span class="material-icons arrow_back" aria-hidden="true"></span>
                        </button>
                        <h3 class="formDialogHeaderTitle">Login to Jellyseerr</h3>
                    </div>
                    <form class="formDialogContent smoothScrollY" style="padding-top:2em">
                        <div class="dialogContentInner dialog-content-centered dialogContentInner-mini">
                            <p style="margin-bottom: 1.5em; color: #ccc;">Hi <b class="sectionTitle">${username}</b>, <br/>Enter your password to get results from Jellyseerr</p>
                            <div class="inputContainer">
                                <input is="emby-input" type="password" id="jellyseerr-password" label="Password" required="required" autocomplete="current-password" />
                            </div>
                            <div id="jellyseerr-login-error" style="color: #ff6b6b; margin-top: 1em; display: none;"></div>
                            <div class="formDialogFooter" style="flex-wrap:nowrap">
                                <button is="emby-button" type="button" class="raised button-cancel block formDialogFooterItem">
                                    <span>Cancel</span>
                                </button>
                                <button is="emby-button" type="submit" class="raised button-submit block formDialogFooterItem">
                                    <span>Login</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(dialogBackdrop);
            document.body.appendChild(dialogContainer);

            const closeModal = () => {
                dialogContainer.remove();
                dialogBackdrop.remove();
            };

            const passwordInput = dialogContainer.querySelector('#jellyseerr-password');
            if (passwordInput) {
                setTimeout(() => passwordInput.focus(), 200);
            }

            // Handle the form submission event
            const form = dialogContainer.querySelector('form');
            form.addEventListener('submit', (e) => {
                e.preventDefault(); // Prevent page reload
                handleLogin(e);
            });

            // Wire up close events
            dialogBackdrop.addEventListener('click', closeModal);
            dialogContainer.querySelector('.btnCancel').addEventListener('click', closeModal);
            dialogContainer.querySelector('.button-cancel').addEventListener('click', closeModal);
        }
        async function handleLogin(e) {
            const dialogContainer = document.querySelector('.jellyseerr-dialog-container');
            if (!dialogContainer) return;

            const loginButton = dialogContainer.querySelector('.button-submit');
            const password = dialogContainer.querySelector('#jellyseerr-password').value;
            const errorDiv = dialogContainer.querySelector('#jellyseerr-login-error');

            Dashboard.showLoadingMsg();
            loginButton.disabled = true;
            errorDiv.style.display = 'none';

            try {
                const currentUser = await ApiClient.getCurrentUser();
                if (!currentUser) {
                    throw new Error('Could not identify current Jellyfin user.');
                }

                if (!password) {
                    throw new Error('Password is required.');
                }

                const response = await fetch(`${ApiClient.serverAddress()}/JellyfinEnhanced/jellyseerr/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: currentUser.Name, password: password })
                });

                if (!response.ok) {
                    let errorMessage = "An unknown error occurred.";
                    try {
                        const errorBody = await response.json();
                        errorMessage = errorBody.message || JSON.stringify(errorBody);
                    } catch(err) {/* Ignore */}
                    if (response.status === 401) errorMessage = "Password incorrect!";
                    throw new Error(errorMessage);
                }

                const result = await response.json();
                authManager.saveToken(result.token);
                updateJellyseerrIcon();

                const backdrop = document.querySelector('.dialogBackdropOpened');
                if (backdrop) backdrop.remove();
                dialogContainer.remove();

            } catch (error) {
                errorDiv.textContent = `${error.message}`;
                errorDiv.style.display = 'block';
            } finally {
                Dashboard.hideLoadingMsg();
                if (loginButton) {
                    loginButton.disabled = false;
                }
            }
        }

        // UI Injection
        function addJellyseerrIconToSearch() {
            const searchInputContainer = document.querySelector('.searchFields .inputContainer');

            if (searchInputContainer && !document.getElementById('jellyseerr-search-icon')) {
                const icon = document.createElement('img');
                icon.id = 'jellyseerr-search-icon';
                icon.src = 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/jellyseerr.svg';
                icon.style.width = '30px';
                icon.style.height = '50px';
                icon.title = 'Jellyseerr Login';

                searchInputContainer.appendChild(icon);
                icon.addEventListener('click', () => showLoginModal());
                updateJellyseerrIcon();
            }
        }

        function updateJellyseerrIcon() {
            const icon = document.getElementById('jellyseerr-search-icon');
            if (icon) {
                if (authManager.isLoggedIn()) {
                    icon.classList.add('active');
                    icon.title = 'Logged into Jellyseerr';
                } else {
                    icon.classList.remove('active');
                    icon.title = 'Login to Jellyseerr';
                }
            }
        }

        // Observer
        function initializeObserver() {
            const observer = new MutationObserver(() => {
                addJellyseerrIconToSearch();
                const isSearchPage = window.location.hash.includes('/search.html');
                const currentQuery = isSearchPage ? new URLSearchParams(window.location.hash.split('?')[1]).get('query') : null;

                if (isSearchPage && currentQuery) {
                    clearTimeout(debounceTimeout);
                    debounceTimeout = setTimeout(() => {
                        if (!authManager.isLoggedIn()) {
                            console.log('🪼 Jellyfin Enhanced: Jellyseerr Search: User not logged in. Skipping search.');
                            document.querySelectorAll('.jellyseerr-section').forEach(e => e.remove());
                            return;
                        }

                        const latestQuery = new URLSearchParams(window.location.hash.split('?')[1]).get('query');
                        if (latestQuery === lastProcessedQuery) return;

                        lastProcessedQuery = latestQuery;

                        document.querySelectorAll('.jellyseerr-section').forEach(e => e.remove());

                        runJellyseerrSearch(latestQuery);
                    }, 1500); // wait 1.5 seconds after typing stops for API call
                } else if (!isSearchPage) {
                    lastProcessedQuery = null;
                    clearTimeout(debounceTimeout);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // API - Fetch search results
        async function fetchFromJellyseerr(query, container) {
            const requestUrl = `${ApiClient.serverAddress()}/JellyfinEnhanced/jellyseerr/search?query=${encodeURIComponent(query)}`;
            const placeholder = createJellyseerrSection(true);

            const searchResultsContainer = document.querySelector('#searchPage .searchResults') ||
                                        document.querySelector('#searchPage [class*="searchResults"]') ||
                                        document.querySelector('#searchPage .padded-top.padded-bottom-page');

            if (searchResultsContainer) {
                searchResultsContainer.prepend(placeholder);
            } else {
                console.error('Could not find search results container to inject placeholder.');
            }

            try {
                const data = await ApiClient.ajax({
                    type: 'GET',
                    url: requestUrl,
                    dataType: 'json',
                    headers: {
                        'X-Jellyseerr-Token': authManager.getToken()
                    }
                });

                placeholder.remove();
                if (data.results && data.results.length > 0) {
                    console.log(`🪼 Jellyfin Enhanced: Jellyseerr Search: Received ${data.results.length} results.`);
                    const jellyseerrSection = createJellyseerrSection(false, data.results);
                    const noResultsMessage = document.querySelector('#searchPage .noItemsMessage');
                    if (noResultsMessage) {
                        noResultsMessage.style.display = 'none';
                    }
                    renderJellyseerrResults(jellyseerrSection, searchResultsContainer);
                } else {
                    console.log('🪼 Jellyfin Enhanced: Jellyseerr Search: No results found.');
                }
            } catch (error) {
                placeholder.remove();
                if (error.status === 401) {
                        authManager.clearToken();
                        updateJellyseerrIcon();
                        console.error('🪼 Jellyfin Enhanced: Jellyseerr Search: Invalid token. Logged out.');
                } else {
                    console.error('🪼 Jellyfin Enhanced: Jellyseerr Search: Error fetching:', error);
                }
            }
        }

        // API - Send the request to Jellyseerr
        async function requestMedia(tmdbId, mediaType, button) {
            button.disabled = true;
            button.innerHTML = `<span>Requesting</span><span class="jellyseerr-button-spinner"></span>`;
            button.classList.remove('jellyseerr-button-error', 'jellyseerr-button-requested');

            let requestBody = {
                mediaType: mediaType,
                mediaId: parseInt(tmdbId)
            };
            if (mediaType === 'tv') { requestBody.seasons = "all"; }

            const requestUrl = `${ApiClient.serverAddress()}/JellyfinEnhanced/jellyseerr/request`;

            try {
                await ApiClient.ajax({
                    type: 'POST',
                    url: requestUrl,
                    data: JSON.stringify(requestBody),
                    contentType: 'application/json',
                    headers: {
                        'X-Jellyseerr-Token': authManager.getToken()
                    }
                });

                button.innerHTML = `<span>Requested <span class="material-icons" style="font-size: 1em; vertical-align: middle;">check_circle</span></span>`;
                button.classList.add('jellyseerr-button-available');

            } catch (error) {
                button.disabled = false;
                console.error('🪼 Jellyfin Enhanced: Jellyseerr Search: Request Failed via proxy:', error);

                let errorText = 'Error';
                if (error.status === 401) {
                    authManager.clearToken();
                    updateJellyseerrIcon();
                    errorText = 'Auth Error';
                }

                button.innerHTML = `<span>${errorText} <span class="material-icons" style="font-size: 1.2em; vertical-align: middle;">error</span></span>`;
                button.classList.add('jellyseerr-button-error');
            }
        }

        function runJellyseerrSearch(query) {
            console.log(`🪼 Jellyfin Enhanced: Jellyseerr Search: Fetching from Jellyseerr for query: "${query}".`);
            fetchFromJellyseerr(query);
        }

        function renderJellyseerrResults(sectionToInject, container) {
            console.log('🪼 Jellyfin Enhanced: Jellyseerr Search: Waiting for Jellyfin results to load...');
            let lastMutationTime = Date.now();
            let stabilityCheckInterval = null;
            let maxWaitTime = 10000;
            let startTime = Date.now();

            const observer = new MutationObserver(() => {
                lastMutationTime = Date.now();
                // console.log('🪼 Jellyfin Enhanced: Jellyseerr Search: Container mutation detected, resetting stability timer.');
            });

            const observeTarget = container || document.querySelector('#searchPage');
            if (observeTarget) {
                observer.observe(observeTarget, {
                    childList: true,
                    subtree: true
                });
            }

            stabilityCheckInterval = setInterval(() => {
                const spinners = document.querySelectorAll('.mdlSpinnerActive, .loading, .spinner, [class*="loading"], [class*="spinner"]');
                const activeSpinner = Array.from(spinners).find(el => el.offsetParent !== null);
                const noResultsMessage = document.querySelector('#searchPage .noItemsMessage');
                const timeSinceLastMutation = Date.now() - lastMutationTime;
                const totalWaitTime = Date.now() - startTime;

                if ((!activeSpinner && timeSinceLastMutation > 1000) || noResultsMessage || totalWaitTime > maxWaitTime) {
                    clearInterval(stabilityCheckInterval);
                    observer.disconnect();

                    if (noResultsMessage) {
                        console.debug('🪼 Jellyfin Enhanced: Jellyseerr Search: Jellyfin returned no results. Injecting Jellyseerr section.');
                        const searchPage = document.querySelector('#searchPage');
                        if (searchPage) {
                            searchPage.insertBefore(sectionToInject, noResultsMessage);
                        }
                        return;
                    }

                    if (totalWaitTime > maxWaitTime) {console.debug('🪼 Jellyfin Enhanced: Jellyseerr Search: Timeout reached, proceeding with injection at the top.');}

                    console.debug('🪼 Jellyfin Enhanced: Jellyseerr Search: Jellyfin results are available. Analyzing results layout...');

                    const searchPage = document.querySelector('#searchPage');
                    if (!searchPage) {
                        console.error('🪼 Jellyfin Enhanced: Jellyseerr Search: Could not find search page for injection.');
                        return;
                    }

                    const allSections = Array.from(searchPage.querySelectorAll('.verticalSection:not(.jellyseerr-section)'));
                    console.debug(`🪼 Jellyfin Enhanced: Jellyseerr Search: Found ${allSections.length} existing sections`);

                    const finalSections = allSections.map(el => ({
                        element: el,
                        title: el.querySelector('.sectionTitle, h2')?.textContent.trim() || ''
                    }));

                    finalSections.forEach(section => {
                        console.debug(`🪼 Jellyfin Enhanced: Jellyseerr Search: Found section: "${section.title}"`);
                    });

                    if (finalSections.length === 0) {
                        console.debug('🪼 Jellyfin Enhanced: Jellyseerr Search: No Jellyfin sections found. Adding to top as fallback.');
                        let injectionPoint = searchPage.querySelector('.searchResults, [class*="searchResults"], .padded-top.padded-bottom-page');
                        if (!injectionPoint) {
                            injectionPoint = document.createElement('div');
                            injectionPoint.className = 'searchResults padded-top padded-bottom-page';
                            searchPage.appendChild(injectionPoint);
                        }
                        injectionPoint.appendChild(sectionToInject);
                        return;
                    }

                    const peopleSection = finalSections.find(s => s.title.toLowerCase().includes('people'));
                    const episodesSection = finalSections.find(s => s.title.toLowerCase().includes('episodes'));
                    const showsSection = finalSections.find(s => s.title.toLowerCase().includes('shows') || s.title.toLowerCase().includes('series'));
                    const moviesSection = finalSections.find(s => s.title.toLowerCase().includes('movies') || s.title.toLowerCase().includes('films'));

                    if (peopleSection) {
                        console.log('🪼 Jellyfin Enhanced: Jellyseerr Search: Results added before People section.');
                        peopleSection.element.parentElement.insertBefore(sectionToInject, peopleSection.element);
                    } else if (episodesSection) {
                        console.log('🪼 Jellyfin Enhanced: Jellyseerr Search: Results added after Episodes section.');
                        const nextSibling = episodesSection.element.nextElementSibling;
                        if (nextSibling) {
                            episodesSection.element.parentElement.insertBefore(sectionToInject, nextSibling);
                        } else {
                            episodesSection.element.parentElement.appendChild(sectionToInject);
                        }
                    } else if (showsSection) {
                        console.log('🪼 Jellyfin Enhanced: Jellyseerr Search: Results added  after Shows section.');
                        const nextSibling = showsSection.element.nextElementSibling;
                        if (nextSibling) {
                            showsSection.element.parentElement.insertBefore(sectionToInject, nextSibling);
                        } else {
                            showsSection.element.parentElement.appendChild(sectionToInject);
                        }
                    } else if (moviesSection) {
                        console.log('🪼 Jellyfin Enhanced: Jellyseerr Search: Results added  after Movies section.');
                        const nextSibling = moviesSection.element.nextElementSibling;
                        if (nextSibling) {
                            moviesSection.element.parentElement.insertBefore(sectionToInject, nextSibling);
                        } else {
                            moviesSection.element.parentElement.appendChild(sectionToInject);
                        }
                    } else {
                        console.log('🪼 Jellyfin Enhanced: Jellyseerr Search: Results added [Fallback].');
                        let fallbackContainer = searchPage.querySelector('.searchResults, [class*="searchResults"], .padded-top.padded-bottom-page');
                        if (!fallbackContainer) {
                            fallbackContainer = document.createElement('div');
                            fallbackContainer.className = 'searchResults padded-top padded-bottom-page';
                            searchPage.appendChild(fallbackContainer);
                        }
                        fallbackContainer.appendChild(sectionToInject);
                    }
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
            card.className = 'card overflowPortraitCard card-hoverable jellyseerr-card';

            card.innerHTML = `
                <div class="cardBox cardBox-bottompadded">
                    <div class="cardScalable">
                        <div class="cardPadder cardPadder-overflowPortrait"></div>
                        <div class="cardImageContainer coveredImage cardContent" style="background-image: url('${posterUrl}');">
                            <div class="cardIndicators">
                                <div class="indicator">
                                    <img src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/jellyseerr.svg" class="jellyseerr-icon" alt="Jellyseerr"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="cardText cardTextCentered cardText-first">
                        <a href="${tmdbUrl}" target="_blank" style="color: inherit; text-decoration: none;" title="View on TMDB">
                            <bdi>${titleText}</bdi>
                        </a>
                    </div>
                    <div class="cardText cardText-secondary jellyseerr-meta">
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
            const status = item.mediaInfo ? item.mediaInfo.status : 1;

            switch (status) {
                case 2: // PENDING_APPROVAL
                case 3: // PROCESSING
                    const buttonText = status === 2 ? 'Pending' : 'Processing';
                    button.innerHTML = `<span>${buttonText}</span><span class="jellyseerr-button-spinner"></span>`;
                    button.disabled = true;
                    button.classList.add('button-submit', 'jellyseerr-button-pending');
                    break;
                case 4: // PARTIALLY_AVAILABLE
                    button.textContent = 'Partially Available';
                    button.disabled = true;
                    button.classList.add('jellyseerr-button-available', 'button-submit');
                    break;
                case 5: // AVAILABLE
                    button.textContent = 'Available';
                    button.disabled = true;
                    button.classList.add('jellyseerr-button-available', 'button-submit');
                    break;
                default: // UNKNOWN or other statuses
                    button.textContent = 'Request';
                    button.disabled = false;
                    button.classList.add('button-submit', 'jellyseerr-button-requested');
                    break;
            }
            const mediaType = item.mediaType;
            if (mediaType === 'movie' || mediaType === 'tv') {
                const imageContainer = card.querySelector('.cardImageContainer');
                if (imageContainer) {
                    const badge = document.createElement('div');
                    badge.style.cssText = `position: absolute; top: 8px; left: 8px; z-index: 2; background-color: ${mediaType === 'movie' ? '#3b82f6' : '#f333d6'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.9em; font-weight: 500; text-shadow: -1px 1px 5px black;`;
                    badge.textContent = mediaType === 'movie' ? 'Movie' : 'Series';
                    imageContainer.appendChild(badge);
                }
            }
            return card;
        }

        // --- Initialization ---
        addStyles();
        initializeObserver();
        document.body.addEventListener('click', function(event) {
            const button = event.target.closest('.jellyseerr-request-button');
            if (button && !button.disabled) {
                requestMedia(button.dataset.tmdbId, button.dataset.mediaType, button);
            }
        });
    };

})(window.JellyfinEnhanced);
