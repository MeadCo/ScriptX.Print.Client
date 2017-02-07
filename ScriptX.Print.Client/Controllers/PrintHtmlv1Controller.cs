using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;
using MeadCo.ScriptX.Print.Messaging.Responses;

namespace ScriptX.Print.Client.Controllers
{
    [System.Web.Http.RoutePrefix("api/v1/printHtml")]
    public class PrintHtmlv1Controller : ApiController
    {
        [System.Web.Http.Route]
        // GET api/v1/printHtml
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        [System.Web.Http.Route("{settingName}")]
        // GET api/v1/printHtml/papersize
        public string Get([FromUri] string settingName)
        {
            return "value";
        }

        [System.Web.Http.Route]
        // POST api/v1/printHtml
        public MeadCo.ScriptX.Print.Messaging.Responses.PrintHtml Post([FromBody] MeadCo.ScriptX.Print.Messaging.Requests.PrintHtml request)
        {
            return new MeadCo.ScriptX.Print.Messaging.Responses.PrintHtml()
            {
                ResponseType = ResponseType.QueuedToFile,
                Message = "Test",
                JobIdentifier = 1
            };
        }

        [System.Web.Http.Route("{settingName}")]
        // PUT api/v1/printHtml/paperSize
        public void Put([FromUri] string settingName, [FromBody]string value)
        {
        }

        [System.Web.Http.Route("PrintedDoc")]
        public IHttpActionResult GetPrintedDoc(string job)
        {
            return NotFound();
        }

    }

}
