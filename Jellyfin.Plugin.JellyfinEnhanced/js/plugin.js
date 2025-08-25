// /js/plugin.js
(function() {
    'use strict';

    /**
     * Loads an array of scripts dynamically into the document head.
     * @param {string[]} scripts - Array of script filenames to load.
     * @param {string} basePath - The base URL path for the scripts.
     * @param {function} callback - Function to execute after all scripts have loaded.
     */
    function loadScripts(scripts, basePath, callback) {
        let loadedCount = 0;
        const totalScripts = scripts.length;

        if (totalScripts === 0) {
            if (callback) callback();
            return;
        }

        scripts.forEach(scriptName => {
            const script = document.createElement('script');
            script.src = `${basePath}/${scriptName}?v=${Date.now()}`; // Cache-busting
            script.onload = () => {
                loadedCount++;
                console.log(`🪼 Jellyfin Enhanced: Loaded component '${scriptName}'`);
                if (loadedCount === totalScripts) {
                    if (callback) callback();
                }
            };
            script.onerror = () => {
                console.error(`🪼 Jellyfin Enhanced: Failed to load script '${scriptName}'`);
                loadedCount++; // Increment even on error to not block the callback
                if (loadedCount === totalScripts) {
                    if (callback) callback();
                }
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Fetches plugin configuration and version from the server.
     * @returns {Promise<[object, string, object]>} A promise that resolves when all data is fetched.
     */
    function loadPluginData() {
        const configPromise = ApiClient.getPluginConfiguration('f69e946a-4b3c-4e9a-8f0a-8d7c1b2c4d9b')
            .then(config => {
                console.log('🪼 Jellyfin Enhanced: Plugin configuration loaded.');
                if (config && config.Shortcuts && Array.isArray(config.Shortcuts)) {
                    const shortcutMap = new Map();
                    for (const shortcut of config.Shortcuts) {
                        if (shortcut.Name) {
                            shortcutMap.set(shortcut.Name, shortcut);
                        }
                    }
                    config.Shortcuts = Array.from(shortcutMap.values());
                }
                return config || {};
            }).catch(err => {
                console.warn('🪼 Jellyfin Enhanced: Could not load plugin configuration, using defaults.', err);
                return {};
            });

        const versionPromise = ApiClient.ajax({
            type: 'GET',
            url: ApiClient.getUrl('/JellyfinEnhanced/version'),
            dataType: 'text'
        }).then(version => {
            console.log('🪼 Jellyfin Enhanced: Plugin version loaded:', version);
            return version;
        }).catch(err => {
            console.warn('🪼 Jellyfin Enhanced: Could not load plugin version.', err);
            return '...';
        });

        const publicConfigPromise = ApiClient.ajax({
            type: 'GET',
            url: ApiClient.getUrl('/JellyfinEnhanced/public-config'),
            dataType: 'json'
        }).then(publicConfig => {
            console.log('🪼 Jellyfin Enhanced: Public configuration loaded.');
            return publicConfig || {};
        }).catch(err => {
            console.warn('🪼 Jellyfin Enhanced: Could not load public configuration.', err);
            return {};
        });

        return Promise.all([configPromise, versionPromise, publicConfigPromise]);
    }

    /**
     * Waits for the Jellyfin API client to be ready, then loads all plugin scripts and initializes them.
     */
    function waitForApiClientAndInitialize() {
        if (typeof ApiClient !== 'undefined' && ApiClient.getPluginConfiguration) {
            loadPluginData().then(([config, version, publicConfig]) => {
                // Assign fetched data to the global namespace
                window.JellyfinEnhanced.pluginConfig = { ...config, ...publicConfig };
                window.JellyfinEnhanced.pluginVersion = version;

                const basePath = '/JellyfinEnhanced/js';
                const allScripts = [
                    'enhanced/config.js',
                    'enhanced/subtitles.js',
                    'enhanced/ui.js',
                    'enhanced/playback.js',
                    'enhanced/features.js',
                    'enhanced/events.js',
                    'elsewhere.js',
                    'jellyseerr.js'
                ];

                // Load all script modules
                loadScripts(allScripts, basePath, () => {
                    // This callback runs only after all scripts have finished loading
                    if (typeof window.JellyfinEnhanced.initializeEnhancedScript === 'function') {
                        window.JellyfinEnhanced.initializeEnhancedScript();
                    }
                    if (typeof window.JellyfinEnhanced.initializeElsewhereScript === 'function') {
                        window.JellyfinEnhanced.initializeElsewhereScript();
                    }
                    if (typeof window.JellyfinEnhanced.initializeJellyseerrScript === 'function') {
                        window.JellyfinEnhanced.initializeJellyseerrScript();
                    }
                    console.log('🪼 Jellyfin Enhanced: All components loaded and initialized.');
                });
            });
        } else {
            setTimeout(waitForApiClientAndInitialize, 200);
        }
    }

    // Create the global namespace and start the initialization process
    window.JellyfinEnhanced = {};
    waitForApiClientAndInitialize();

})();
