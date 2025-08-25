using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Jellyfin.Plugin.JellyfinEnhanced.Controllers
{
    public class JellyseerrUser
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("jellyfinUserId")]
        public string JellyfinUserId { get; set; } = string.Empty;

        [JsonPropertyName("username")]
        public string Username { get; set; } = string.Empty;
    }
    public class JellyseerrLoginRequest
    {
        [JsonPropertyName("username")]
        public string Username { get; set; } = string.Empty;

        [JsonPropertyName("password")]
        public string Password { get; set; } = string.Empty;
    }
    [Route("JellyfinEnhanced")]
    [ApiController]
    public class JellyfinEnhancedController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<JellyfinEnhancedController> _logger;

        public JellyfinEnhancedController(IHttpClientFactory httpClientFactory, ILogger<JellyfinEnhancedController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        private ActionResult GetScriptResource(string resourcePath)
        {
            var stream = Assembly.GetExecutingAssembly()
                .GetManifestResourceStream($"Jellyfin.Plugin.JellyfinEnhanced.{resourcePath.Replace('/', '.')}");

            if (stream == null)
            {
                _logger.LogError("Could not find embedded script at path: {resourcePath}", resourcePath);
                return NotFound();
            }

            return new FileStreamResult(stream, "application/javascript");
        }

        [HttpGet("script")]
        public ActionResult GetMainScript()
        {
            return GetScriptResource("js/plugin.js");
        }

        [HttpGet("js/{**path}")]
        public ActionResult GetScript(string path)
        {
            return GetScriptResource($"js/{path}");
        }

        [HttpGet("version")]
        [Produces("text/plain")]
        public ActionResult GetVersion()
        {
            var version = JellyfinEnhanced.Instance?.Version.ToString() ?? "unknown";
            return Content(version);
        }

        [HttpGet("public-config")]
        [Produces("application/json")]
        public ActionResult GetPublicConfig()
        {
            var config = JellyfinEnhanced.Instance?.Configuration;
            if (config == null)
            {
                return StatusCode(503, "🪼 Jellyfin Enhanced: Jellysee Search: Configuration not available.");
            }

            var publicConfig = new
            {
                JellyseerrEnabled = config.JellyseerrEnabled
            };

            return new JsonResult(publicConfig);
        }
        private async Task<IActionResult> ProxyJellyseerrRequest(string apiPath, HttpMethod method, string? content = null)
        {
            var config = JellyfinEnhanced.Instance?.Configuration;
            if (config == null || !config.JellyseerrEnabled || string.IsNullOrEmpty(config.JellyseerrUrls))
            {
                return StatusCode(503, "🪼 Jellyfin Enhanced: Jellysee Search: Jellyseerr integration is not configured or enabled.");
            }

            if (!Request.Headers.TryGetValue("X-Jellyseerr-Token", out var token))
            {
                return Unauthorized("🪼 Jellyfin Enhanced: Jellysee Search: Jellyseerr authentication token is missing.");
            }

            var urls = config.JellyseerrUrls.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Add("Cookie", token.ToString());

            foreach (var url in urls)
            {
                var trimmedUrl = url.Trim();
                try
                {
                    var requestUri = $"{trimmedUrl}{apiPath}";
                    _logger.LogInformation("🪼 Jellyfin Enhanced: Jellysee Search: Proxying user request to: {RequestUri}", requestUri);

                    var request = new HttpRequestMessage(method, requestUri);

                    if (content != null)
                    {
                        request.Content = new StringContent(content, Encoding.UTF8, "application/json");
                    }

                    var response = await httpClient.SendAsync(request);
                    var responseContent = await response.Content.ReadAsStringAsync();

                    if (response.IsSuccessStatusCode)
                    {
                        return Content(responseContent, "application/json");
                    }
                    _logger.LogWarning("🪼 Jellyfin Enhanced: Jellysee Search: Request to Jellyseerr URL {Url} failed with status {StatusCode}.", trimmedUrl, response.StatusCode);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "🪼 Jellyfin Enhanced: Jellysee Search: Failed to connect to Jellyseerr URL: {Url}", trimmedUrl);
                    continue;
                }
            }
            _logger.LogError("🪼 Jellyfin Enhanced: Jellysee Search: Could not connect to any configured Jellyseerr instance.");
            return StatusCode(500, "🪼 Jellyfin Enhanced: Jellysee Search: Could not connect to any configured Jellyseerr instance.");
        }

        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        [IgnoreAntiforgeryToken]
        [HttpPost("jellyseerr/login")]
        public async Task<IActionResult> JellyseerrLogin([FromBody] JellyseerrLoginRequest loginRequest)
        {
            var config = JellyfinEnhanced.Instance?.Configuration;
            if (config == null || !config.JellyseerrEnabled || string.IsNullOrEmpty(config.JellyseerrUrls))
            {
                return StatusCode(503, new { message = "🪼 Jellyfin Enhanced: Jellysee Search: Jellyseerr integration is not configured or enabled on the server." });
            }

            var urls = config.JellyseerrUrls.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            var httpClient = _httpClientFactory.CreateClient();
            var payload = JsonSerializer.Serialize(new { username = loginRequest.Username, password = loginRequest.Password });

            foreach (var url in urls)
            {
                var trimmedUrl = url.Trim().TrimEnd('/');
                try
                {
                    var requestUri = $"{trimmedUrl}/api/v1/auth/jellyfin";
                    var request = new HttpRequestMessage(HttpMethod.Post, requestUri)
                    {
                        Content = new StringContent(payload, Encoding.UTF8, "application/json")
                    };

                    var response = await httpClient.SendAsync(request);
                    if (response.IsSuccessStatusCode)
                    {
                        if (response.Headers.TryGetValues("Set-Cookie", out var cookies))
                        {
                            var sessionCookie = cookies.FirstOrDefault(c => c.StartsWith("connect.sid="));
                            if (sessionCookie != null)
                            {
                                _logger.LogInformation("🪼 Jellyfin Enhanced: Jellysee Search: Successfully authenticated user '{Username}' with Jellyseerr at {Url}", loginRequest.Username, trimmedUrl);
                                return Ok(new { token = sessionCookie.Split(';')[0] });
                            }
                        }
                        _logger.LogWarning("🪼 Jellyfin Enhanced: Jellysee Search: Jellyseerr login to {Url} was successful but no session token was found.", trimmedUrl);
                        return StatusCode(500, new { message = "Login successful, but could not retrieve session token." });
                    }

                    // Log non-successful but handled responses, e.g., 401 Unauthorized
                    _logger.LogWarning("🪼 Jellyfin Enhanced: Jellysee Search: Jellyseerr login attempt to {Url} failed with status code {StatusCode}.", trimmedUrl, response.StatusCode);

                    // If it's a 401, we know the credentials are bad, no point in trying other URLs.
                    if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                    {
                        return StatusCode(401, new { message = "Invalid username or password." });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "🪼 Jellyfin Enhanced: Jellysee Search: Failed to connect to Jellyseerr URL: {Url}", trimmedUrl);
                    continue; // Try the next URL
                }
            }

            _logger.LogError("🪼 Jellyfin Enhanced: Jellysee Search: Could not connect to or authenticate with any configured Jellyseerr instance for user '{Username}'.", loginRequest.Username);
            return StatusCode(500, new { message = "🪼 Jellyfin Enhanced: Jellysee Search: Could not connect to any configured Jellyseerr instances." });
        }

        [HttpGet("jellyseerr/search")]
        public Task<IActionResult> JellyseerrSearch([FromQuery] string query)
        {
            return ProxyJellyseerrRequest($"/api/v1/search?query={Uri.EscapeDataString(query)}", HttpMethod.Get);
        }

        [HttpPost("jellyseerr/request")]
        public async Task<IActionResult> JellyseerrRequest([FromBody] JsonElement requestBody)
        {
            return await ProxyJellyseerrRequest("/api/v1/request", HttpMethod.Post, requestBody.ToString());
        }
    }
}