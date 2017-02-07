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
    }
}
