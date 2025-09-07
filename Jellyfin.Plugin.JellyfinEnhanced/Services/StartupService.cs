using System;
using System.IO;
using System.Reflection;
using System.Runtime.Loader;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Jellyfin.Plugin.JellyfinEnhanced.Helpers;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Model.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace Jellyfin.Plugin.JellyfinEnhanced.Services
{
    public class StartupService : IScheduledTask
    {
        private readonly ILogger<StartupService> _logger;
        private readonly IApplicationPaths _applicationPaths;

        public string Name => "Jellyfin Enhanced Startup";
        public string Key => "JellyfinEnhancedStartup";
        public string Description => "Injects the Jellyfin Enhanced script using the File Transformation plugin and performs necessary cleanups.";
        public string Category => "Startup Services";

        public StartupService(ILogger<StartupService> logger, IApplicationPaths applicationPaths)
        {
            _logger = logger;
            _applicationPaths = applicationPaths;
        }

        public async Task ExecuteAsync(IProgress<double> progress, CancellationToken cancellationToken)
        {
            await Task.Run(() =>
            {
                RegisterFileTransformation();
            }, cancellationToken);
        }

        private void RegisterFileTransformation()
        {
            Assembly? fileTransformationAssembly =
                AssemblyLoadContext.All.SelectMany(x => x.Assemblies).FirstOrDefault(x =>
                    x.FullName?.Contains(".FileTransformation") ?? false);

            if (fileTransformationAssembly != null)
            {
                Type? pluginInterfaceType = fileTransformationAssembly.GetType("Jellyfin.Plugin.FileTransformation.PluginInterface");

                if (pluginInterfaceType != null)
                {
                    var payload = new JObject
                    {
                        { "id", "66b28073-a193-4bbe-a009-b1bbb6f8257a" }, // Using the plugin's GUID as a unique ID
                        { "fileNamePattern", "index.html" },
                        { "callbackAssembly", GetType().Assembly.FullName },
                        { "callbackClass", typeof(TransformationPatches).FullName },
                        { "callbackMethod", nameof(TransformationPatches.IndexHtml) }
                    };

                    pluginInterfaceType.GetMethod("RegisterTransformation")?.Invoke(null, new object?[] { payload });
                    _logger.LogInformation("Successfully registered Jellyfin Enhanced script injection with the File Transformation plugin.");
                }
                else
                {
                    _logger.LogWarning("Could not find PluginInterface in FileTransformation assembly. Using fallback injection method.");
                    JellyfinEnhanced.Instance?.InjectScript();
                }
            }
            else
            {
                _logger.LogWarning("File Transformation plugin not found. Using fallback injection method.");
                JellyfinEnhanced.Instance?.InjectScript();
            }
        }

        public IEnumerable<TaskTriggerInfo> GetDefaultTriggers()
        {
            yield return new TaskTriggerInfo
            {
                Type = TaskTriggerInfo.TriggerStartup
            };
        }
    }
}
