using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ScriptX.Services_Client
{
    [Route("scripts")]

    public class ScriptsController : Controller
    {
        // GET: /<controller>/
        [HttpGet]
        [Route("~/scripts")]
        public IActionResult Index([FromServices] IFileProvider fileProvider,[FromQuery] string name)
        {
            var absolutePath = fileProvider.GetFileInfo(name);
            return PhysicalFile(absolutePath.PhysicalPath, "text/javascript");
        }

        [HttpGet]
        [Route("test")]
        public IActionResult Test()
        {
            return Ok();
        }
    }
}
