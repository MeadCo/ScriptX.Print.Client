using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using System.Web.Routing;
using MeadCo.ScriptX.Print.Messaging.Models;
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

        [Route("settings")]
        public IHttpActionResult GetSettings()
        {
            var settings = new HtmlPrintSettings();

            return Ok(settings);
        }

        [Route("deviceinfo/{deviceName}/{units?}")]
        public IHttpActionResult GetDeviceInfo([FromUri] string deviceName, [FromUri] Page.PageMarginUnits units = Page.PageMarginUnits.Default)
        {
            var settings = new DeviceSettings();
            return Ok(settings);
        }

        [Route("htmlPrintDefaults/{units?}")]
        [HttpGet]
        public IHttpActionResult GetDefaults([FromUri] Page.PageMarginUnits units = Page.PageMarginUnits.Default)
        {
            PrintHtmlDefaultSettings allSettings = new PrintHtmlDefaultSettings()
            {
                HtmlPrintSettings = new HtmlPrintSettings()
                {
                    Header = "Default header"
                },
                DeviceSettings = new DeviceSettings() // return data available to basic level subscribers
            };

            DeviceSettings ds = allSettings.DeviceSettings;
            ds.PrinterName = "UI Testing printer";
            ds.PaperSizeName = "A4";
            ds.PaperSourceName = "Automatically select";
            ds.Copies = 1;
            ds.Collate = BooleanOption.False;
            ds.IsDefault = true;

            return Ok(allSettings);
        }

        [Route("print")]
        // POST api/v1/printHtml
        public MeadCo.ScriptX.Print.Messaging.Responses.Print PostPrint([FromBody] MeadCo.ScriptX.Print.Messaging.Requests.PrintHtmlDescription requestMessage)
        {
            // cache what was sent for return 
            try
            {
                LicenseDetail license = ((ApiIdentity)HttpContext.Current.User.Identity).License;

                using (StreamWriter testData = new StreamWriter(FileNameForJob(_jobCounter), false))
                {
                    var content = requestMessage.Content.Replace("\n", "\r\n");

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
                Status = PrintRequestStatus.QueuedToFile,
                Message = "Test",
                JobIdentifier = _jobCounter++
            };
        }

        [Route("status/{jobIdentifier:int}")]
        public MeadCo.ScriptX.Print.Messaging.Responses.JobStatus GetStatus(int jobIdentifier)
        {
            return new JobStatus(jobIdentifier)
            {
                Message = "Test",
                Status = ++_counter > JobCounterWait ? PrintHtmlStatus.Printing : PrintHtmlStatus.Completed
            };
        }

        private string FileNameForJob(int jobName)
        {
            return Path.Combine(HostingEnvironment.MapPath("~/App_data"), $"{jobName}.txt");
        }

        [Route("download/{jobIdentifier:int}")]
        [AllowAnonymous]
        public IHttpActionResult GetDownloadPrint(int jobIdentifier)
        {
            var fileInfo = new FileInfo(FileNameForJob(jobIdentifier));

            return _counter < JobCounterWait 
                ? (IHttpActionResult)NotFound()
                : new FileDownloadResult(fileInfo.FullName);
        }


    }

}
