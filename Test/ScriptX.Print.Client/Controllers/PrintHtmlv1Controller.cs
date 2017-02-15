using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web.Hosting;
using System.Web.Http;
using System.Web.Routing;
using MeadCo.ScriptX.Print.Messaging.Responses;
using ScriptX.Print.Client.Results;

namespace ScriptX.Print.Client.Controllers
{
    [RoutePrefix("api/v1/printHtml")]
    public class PrintHtmlv1Controller : ApiController
    {
        private static int _counter = 1;

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
            _counter = 1;
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

        [Route("status/{jobIdentifier:int}")]
        // Get api/v1/printHtml/status/jobid
        public MeadCo.ScriptX.Print.Messaging.Responses.Print GetStatus(int jobIdentifier)
        {
            return new MeadCo.ScriptX.Print.Messaging.Responses.Print()
            {
                ResponseType = ++_counter > 5 ? ResponseType.Ok : ResponseType.QueuedToFile,
                JobIdentifier = jobIdentifier
            };
        }

        private string FileNameForJob(string jobName)
        {
            return Path.Combine(HostingEnvironment.MapPath("~/App_data"), jobName);
        }


        [Route("DownloadPrint/{jobId}")]
        public IHttpActionResult GetDownloadPrint(string jobId)
        {
            var fileInfo = new FileInfo(FileNameForJob("Test.pdf"));

            return _counter < 6 
                ? (IHttpActionResult)NotFound()
                : new FileDownloadResult(new FileInfo(FileNameForJob("Test.pdf")).FullName);
        }


    }

}
