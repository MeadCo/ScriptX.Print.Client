using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using System.Web.Routing;
using MeadCo.ScriptX.Print.Messaging.Responses;
using ScriptX.Print.Client.Attributes;
using ScriptX.Print.Client.Identity;
using ScriptX.Print.Client.Results;

namespace ScriptX.Print.Client.Controllers
{
    [AuthenticateLicense]
    [RoutePrefix("api/v1/printHtml")]
    public class PrintHtmlv1Controller : ApiController
    {
        private const int JobCounterWait = 1;
        private static int _counter = 1;
        private static int _jobCounter = 1;

        [Route("{settingName}")]
        // GET api/v1/printHtml/papersize
        public string Get([FromUri] string settingName)
        {
            return settingName;
        }

        [Route]
        // POST api/v1/printHtml
        public MeadCo.ScriptX.Print.Messaging.Responses.Print Post([FromBody] MeadCo.ScriptX.Print.Messaging.Requests.PrintHtml request)
        {

            // cache what was sent for return 
            try
            {
                LicenseDetail license = ((ApiIdentity)HttpContext.Current.User.Identity).License;

                using (StreamWriter testData = new StreamWriter(FileNameForJob(_jobCounter), false))
                {
                    var content = request.Content.Replace("\n", "\r\n");

                    testData.WriteLine(content);
                }
            }
            catch (Exception e)
            {
                throw new Exception("Failed to cache content: " + e.Message);
            }

            _counter = 0;
            return new MeadCo.ScriptX.Print.Messaging.Responses.Print()
            {
                ResponseType = ResponseType.QueuedToFile,
                Message = "Test",
                JobIdentifier = _jobCounter++
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
                ResponseType = ++_counter > JobCounterWait ? ResponseType.Ok : ResponseType.QueuedToFile,
                JobIdentifier = jobIdentifier
            };
        }

        private string FileNameForJob(int jobName)
        {
            return Path.Combine(HostingEnvironment.MapPath("~/App_data"), $"{jobName}.txt");
        }

        [AllowAnonymous]
        [Route("DownloadPrint/{jobId:int}")]
        public IHttpActionResult GetDownloadPrint(int jobId)
        {
            var fileInfo = new FileInfo(FileNameForJob(jobId));

            return _counter < JobCounterWait 
                ? (IHttpActionResult)NotFound()
                : new FileDownloadResult(fileInfo.FullName);
        }


    }

}
