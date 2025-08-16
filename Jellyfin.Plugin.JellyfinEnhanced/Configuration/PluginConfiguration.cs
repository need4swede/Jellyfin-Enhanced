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
    }
}
