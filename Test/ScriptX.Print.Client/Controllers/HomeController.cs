using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;

namespace ScriptX.Print.Client.Controllers
{
    public class HomeController : Controller
    {
        [Route("~/")]
        [Route("Index")]
#if DEBUG
        [Route("~/Home/Index")] // required for debugging
#endif
        [HttpGet]
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            return View();
        }

        [Route("Modern")]
        [HttpGet]
        public ActionResult Modern()
        {
            ViewBag.Title = "Supporting modern code";
            return View();
        }

        [Route("FactoryShim")]
        [HttpGet]
        public ActionResult ShimFactory()
        {
            ViewBag.Title = "Supporting code written against 'factory'";
            return View();
        }

        [Route("MeadCoJSShim")]
        [HttpGet]
        public ActionResult ShimMeadCoJS()
        {
            ViewBag.Title = "Supporting code written against 'MeadCo.ScriptX'";
            return View();
        }

        [Route("script")]
        [HttpGet]
        public FileStreamResult Script(string filename)
        {
            string absoluteName = Path.Combine(HostingEnvironment.MapPath("~"), Path.Combine("..\\..\\src",filename));
            Stream fileStream = new FileStream(absoluteName,FileMode.Open);
            return File(fileStream, "application/javascript");
        }

        [Route("FrameContent")]
        [HttpGet]
        public ActionResult FramedHeaderFooterArgs()
        {
            return View();
        }
    }
}
