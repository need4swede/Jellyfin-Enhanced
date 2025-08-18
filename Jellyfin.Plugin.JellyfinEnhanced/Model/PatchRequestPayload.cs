using System.Text.Json.Serialization;

namespace Jellyfin.Plugin.JellyfinEnhanced.Model
{
    public class PatchRequestPayload
    {
        [JsonPropertyName("contents")]
        public string? Contents { get; set; }
    }
}