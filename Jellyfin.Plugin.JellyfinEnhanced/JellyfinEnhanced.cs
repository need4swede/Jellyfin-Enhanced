using System.Globalization;
using Jellyfin.Plugin.JellyfinEnhanced.Configuration;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;
using System.IO;
using System.Collections.Generic;
using System;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;


namespace Jellyfin.Plugin.JellyfinEnhanced
{
    public class JellyfinEnhanced : BasePlugin<PluginConfiguration>, IHasWebPages
    {
        private readonly IApplicationPaths _applicationPaths;
        private readonly ILogger<JellyfinEnhanced> _logger;

        public JellyfinEnhanced(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer, ILoggerFactory loggerFactory) : base(applicationPaths, xmlSerializer)
        {
            Instance = this;
            _applicationPaths = applicationPaths;
            _logger = loggerFactory.CreateLogger<JellyfinEnhanced>();

            // Inject script on plugin initialization
            InjectScript();
        }

        public override string Name => "Jellyfin Enhanced";

        public override Guid Id => Guid.Parse("f69e946a-4b3c-4e9a-8f0a-8d7c1b2c4d9b");

        public static JellyfinEnhanced? Instance { get; private set; }

        public string IndexHtmlPath => Path.Combine(_applicationPaths.WebPath, "index.html");

        private void InjectScript()
        {
            try
            {
                var indexPath = IndexHtmlPath;
                if (string.IsNullOrEmpty(indexPath) || !File.Exists(indexPath))
                {
                    _logger.LogError("Could not find index.html at path: {Path}", indexPath);
                    return;
                }

                var pluginVersion = Version.ToString();
                var scriptUrl = "/JellyfinEnhanced/script";
                var scriptTag = $"<script plugin=\"JellyfinEnhanced\" version=\"{pluginVersion}\" src=\"{scriptUrl}\" defer></script>";

                var content = File.ReadAllText(indexPath);

                // If the exact correct script tag is already present, do nothing.
                if (content.Contains(scriptTag))
                {
                    _logger.LogInformation("JellyfinEnhanced script is already correctly injected. No changes needed.");
                    return;
                }

                // Regex to find any old/previous versions of our script tag.
                var regex = new Regex($"<script[^>]*src=[\"']{scriptUrl}[\"'][^>]*>\\s*</script>\\n?");

                if (regex.IsMatch(content))
                {
                    _logger.LogInformation("Removing old JellyfinEnhanced script tag.");
                    content = regex.Replace(content, string.Empty);
                }

                var closingBodyTag = "</body>";
                if (content.Contains(closingBodyTag))
                {
                    content = content.Replace(closingBodyTag, $"{scriptTag}\n{closingBodyTag}");
                    File.WriteAllText(indexPath, content);
                    _logger.LogInformation("Successfully injected/updated the JellyfinEnhanced script in index.html.");
                }
                else
                {
                    _logger.LogWarning("Could not find </body> tag in index.html. Script not injected.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while trying to inject script into index.html.");
            }
        }

        public IEnumerable<PluginPageInfo> GetPages()
        {
            return new[]
            {
                new PluginPageInfo
                {
                    Name = this.Name,
                    EmbeddedResourcePath = "Jellyfin.Plugin.JellyfinEnhanced.Configuration.configPage.html"
                }
            };
        }
    }
}
