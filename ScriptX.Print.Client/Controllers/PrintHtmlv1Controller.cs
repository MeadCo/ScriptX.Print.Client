using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using MeadCo.ScriptX.Print.Messaging.Responses;

namespace ScriptX.Print.Client.Controllers
{
    [RoutePrefix("api/v1/printHtml")]
    public class PrintHtmlv1Controller : ApiController
    {
        [Route]
        // GET api/v1/printHtml
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        [Route("{settingName}")]
        // GET api/v1/printHtml/papersize
        public string Get([FromUri] string settingName)
        {
            return settingName;
        }

        [Route]
        // POST api/v1/printHtml
        public MeadCo.ScriptX.Print.Messaging.Responses.Print Post([FromBody] MeadCo.ScriptX.Print.Messaging.Requests.Print request)
        {
            return new MeadCo.ScriptX.Print.Messaging.Responses.Print()
            {
                ResponseType = ResponseType.QueuedToFile,
                Message = "Test",
                JobIdentifier = 1
            };
        }

        [Route("{settingName}")]
        // PUT api/v1/printHtml/paperSize
        public void Put([FromUri] string settingName, [FromBody]string value)
        {
        }

        [Route("PrintedDoc")]
        public IHttpActionResult GetPrintedDoc(string job)
        {
            return NotFound();
        }

    }

}
