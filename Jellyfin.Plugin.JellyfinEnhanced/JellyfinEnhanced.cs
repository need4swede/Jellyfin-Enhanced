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
        }

        public override string Name => "Jellyfin Enhanced";
        public override Guid Id => Guid.Parse("f69e946a-4b3c-4e9a-8f0a-8d7c1b2c4d9b");
        public static JellyfinEnhanced? Instance { get; private set; }
        public string IndexHtmlPath => Path.Combine(_applicationPaths.WebPath, "index.html");

        /// <summary>
        /// Called when the plugin is being uninstalled.
        /// </summary>
        public override void OnUninstalling()
        {
            // Final cleanup on uninstall to be safe
            try
            {
                var indexPath = IndexHtmlPath;
                if (string.IsNullOrEmpty(indexPath) || !File.Exists(indexPath))
                {
                    _logger.LogError("Could not find index.html at path: {Path}", indexPath);
                    return;
                }

                var content = File.ReadAllText(indexPath);
                var regex = new Regex($"<script plugin=\"{Name}\".*?></script>\\n?");
                if (regex.IsMatch(content))
                {
                    content = regex.Replace(content, string.Empty);
                    File.WriteAllText(indexPath, content);
                    _logger.LogInformation("Successfully removed the {Name} script from index.html during uninstall.", Name);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while trying to remove script from index.html during uninstall.");
            }

            base.OnUninstalling();
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