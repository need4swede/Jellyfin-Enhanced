using System;
using System.Text.RegularExpressions;
using Jellyfin.Plugin.JellyfinEnhanced.Model;

namespace Jellyfin.Plugin.JellyfinEnhanced.Helpers
{
    public static class TransformationPatches
    {
        public static string IndexHtml(PatchRequestPayload content)
        {
            if (string.IsNullOrEmpty(content.Contents))
            {
                return content.Contents ?? string.Empty;
            }

            var pluginName = "Jellyfin Enhanced (Need4Swede)";
            var pluginVersion = JellyfinEnhanced.Instance?.Version.ToString() ?? "unknown";

            var scriptUrl = "../JellyfinEnhanced/script";
            var scriptTag = $"<script plugin=\"{pluginName}\" version=\"{pluginVersion}\" src=\"{scriptUrl}\" defer></script>";

            var regex = new Regex($"<script[^>]*plugin=[\"']{pluginName}[\"'][^>]*>\\s*</script>\\n?");
            var updatedContent = regex.Replace(content.Contents, string.Empty);

            // 3. Inject the new script tag.
            if (updatedContent.Contains("</body>"))
            {
                return updatedContent.Replace("</body>", $"{scriptTag}\n</body>");
            }

            return updatedContent;
        }
    }
}
