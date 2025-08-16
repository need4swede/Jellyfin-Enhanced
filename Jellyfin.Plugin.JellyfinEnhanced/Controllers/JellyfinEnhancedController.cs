using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace Jellyfin.Plugin.JellyfinEnhanced.Controllers;

[Route("JellyfinEnhanced")]
[ApiController]
public class JellyfinEnhancedController : ControllerBase
{
    [HttpGet("script")]
    [Produces("application/javascript")]
    public ActionResult GetScript()
    {
        var stream = Assembly.GetExecutingAssembly()
            .GetManifestResourceStream("Jellyfin.Plugin.JellyfinEnhanced.plugin.js");

        if (stream == null)
        {
            return NotFound();
        }

        return new FileStreamResult(stream, "application/javascript");
    }

    [HttpGet("version")]
    [Produces("text/plain")]
    public ActionResult GetVersion()
    {
        var version = JellyfinEnhanced.Instance?.Version.ToString() ?? "unknown";
        return Content(version);
    }
}
