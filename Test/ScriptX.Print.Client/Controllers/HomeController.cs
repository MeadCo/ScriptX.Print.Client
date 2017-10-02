﻿using System;
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
            return View(new Models.Sample("Supporting modern code"));
        }

        [Route("FactoryShim")]
        [HttpGet]
        public ActionResult ShimFactory()
        {
            return View(new Models.Sample("Supporting code written against 'factory'"));
        }

        [Route("MeadCoJSShim")]
        [HttpGet]
        public ActionResult ShimMeadCoJS()
        {
            return View(new Models.Sample("Supporting code written against 'MeadCo.ScriptX'"));
        }

        [Route("MeadCoJSShim2")]
        [HttpGet]
        public ActionResult ShimMeadCoJS2()
        {
            return View(new Models.Sample("Supporting code written against 'MeadCo.ScriptX' included first"));
        }

        [Route("MeadCoJSShim3")]
        [HttpGet]
        public ActionResult ShimMeadCoJS3()
        {
            return View(new Models.Sample("Supporting async code written against 'MeadCo.ScriptX' included first"));
        }

        [Route("EnhfBasic")]
        [HttpGet]
        public ActionResult EnhfBasic()
        {
            return View(new Models.Sample("Enhanced formatting with MeadCoJS shim"));
        }


        [Route("Inspector")]
        [HttpGet]
        public ActionResult Inspector()
        {
            return View(new Models.Sample("Looking into the implementation"));
        }

        [Route("UmdInspector")]
        [HttpGet]
        public ActionResult UmdInspector()
        {
            return View(new Models.Sample("Looking into the implementation"));
        }


        /// <summary>
        /// Return a script file from outside the web app root.
        /// </summary>
        /// <param name="filename"></param>
        /// <returns></returns>
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
