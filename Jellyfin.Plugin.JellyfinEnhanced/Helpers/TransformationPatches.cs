using Jellyfin.Plugin.JellyfinEnhanced.Model;

namespace Jellyfin.Plugin.JellyfinEnhanced.Helpers
{
    public static class TransformationPatches
    {
        public static string IndexHtml(PatchRequestPayload content)
        {
            // Return original content if it's null or empty to avoid issues.
            if (string.IsNullOrEmpty(content.Contents))
            {
                return content.Contents ?? string.Empty;
            }

            var pluginVersion = JellyfinEnhanced.Instance?.Version.ToString() ?? "unknown";
            var scriptUrl = "/JellyfinEnhanced/script";
            var scriptTag = $"<script plugin=\"JellyfinEnhanced\" version=\"{pluginVersion}\" src=\"{scriptUrl}\" defer></script>";

            if (content.Contents.Contains("</body>"))
            {
                return content.Contents.Replace("</body>", $"{scriptTag}</body>");
            }

            // Fallback in case </body> tag isn't found
            return content.Contents;
        }
    }
}