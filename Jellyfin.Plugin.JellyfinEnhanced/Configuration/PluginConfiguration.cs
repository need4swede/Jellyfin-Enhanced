using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.JellyfinEnhanced.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public PluginConfiguration()
        {
            // Jellyfin Enhanced Settings
            ClearBookmarksDelay = 3000;
            ToastDuration = 1500;
            HelpPanelAutocloseDelay = 15000;

            // Jellyfin Elsewhere Settings
            TMDB_API_KEY = "";
            DEFAULT_REGION = "US";
            DEFAULT_PROVIDERS = "";
            IGNORE_PROVIDERS = "";

            ClearLocalStorageTimestamp = 0;

            // Default User Settings
            AutoPauseEnabled = true;
            AutoResumeEnabled = false;
            AutoSkipIntro = false;
            AutoSkipOutro = false;
            RandomButtonEnabled = true;
            RandomIncludeMovies = true;
            RandomIncludeShows = true;
            RandomUnwatchedOnly = false;
            ShowFileSizes = false;
            RemoveContinueWatchingEnabled = false;
        }

        // Jellyfin Enhanced Settings
        public int ClearBookmarksDelay { get; set; }
        public int ToastDuration { get; set; }
        public int HelpPanelAutocloseDelay { get; set; }

        // Jellyfin Elsewhere Settings
        public string TMDB_API_KEY { get; set; }
        public string DEFAULT_REGION { get; set; }
        public string DEFAULT_PROVIDERS { get; set; }
        public string IGNORE_PROVIDERS { get; set; }
        public long ClearLocalStorageTimestamp { get; set; }

        // Default User Settings
        public bool AutoPauseEnabled { get; set; }
        public bool AutoResumeEnabled { get; set; }
        public bool AutoSkipIntro { get; set; }
        public bool AutoSkipOutro { get; set; }
        public bool RandomButtonEnabled { get; set; }
        public bool RandomIncludeMovies { get; set; }
        public bool RandomIncludeShows { get; set; }
        public bool RandomUnwatchedOnly { get; set; }
        public bool ShowFileSizes { get; set; }
        public bool RemoveContinueWatchingEnabled { get; set; }
    }
}