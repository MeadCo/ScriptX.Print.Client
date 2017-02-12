using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
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
            ViewBag.Title = "Supportng code written against 'MeadCo.ScriptX'";
            return View();
        }
    }
}
