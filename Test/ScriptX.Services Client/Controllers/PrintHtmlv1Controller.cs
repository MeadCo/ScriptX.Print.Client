using MeadCo.ScriptX.Print.Messaging.Models;
using MeadCo.ScriptX.Print.Messaging.Requests;
using MeadCo.ScriptX.Print.Messaging.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ScriptX.Services_Client.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace ScriptX.Services_Client.Controllers
{
    [Route("api/v1/printhtml")]
    [ApiController]
    public class PrintHtmlv1Controller : ControllerBase
    {
        private ILogger _logger;
        private IMockAuthentication _mockAuthentication;

        private static int counter = 0;

        public PrintHtmlv1Controller(ILogger<PrintHtmlv1Controller> logger, IMockAuthentication mockAuthentication)
        {
            _logger = logger;
            _mockAuthentication = mockAuthentication;
        }

        /// <summary>
        /// Return the default settings for printing HTML content (headers, foooters, margins etc.)
        /// </summary>
        /// <remarks>
        ///  - requires basic license
        /// </remarks>
        /// <returns></returns>
        // GET api/v1/printHtml/settings
        [Route("settings")]
        [Produces("application/json")]
        public ActionResult<HtmlPrintSettings> GetSettings()
        {
            if (!HandleAuthentication())
            {
                return Unauthorized();
            }

            var settings = new HtmlPrintSettings();

            _logger.LogInformation("GET api/v1/printHtml/settings");

            return settings;
        }

        /// <summary>
        /// Return the settings for a print device the HTML will be printed to (paper size, source etc.)
        /// </summary>
        /// <remarks>
        /// - requires advanced license
        /// - deviceName must be the name of the device on the server or 'default' for the service default printer.
        /// </remarks>
        /// <param name="deviceName"></param>
        /// <param name="units"></param>
        /// <returns></returns>
        // get api/v1/printhtml/deviceinfo/{devicename}
        [Route("deviceinfo/{deviceName}/{units?}")]
        [Produces("application/json")]

        public ActionResult<DeviceSettings> GetDeviceInfo(string deviceName, MeasurementUnits units = MeasurementUnits.Default)
        {
            // we have had to replace \ with || to get past cors checking, so reinstate \ (NB: we are assuming || is rare in a printer name!)
            deviceName = deviceName.Replace("||", "\\");
            _logger.LogInformation("GET api/v1/printhtml/deviceinfo/{deviceName}/{units}", deviceName, units);

            if (!HandleAuthentication())
            {
                return Unauthorized();
            }

            if (string.CompareOrdinal(deviceName, "default") != 0  && string.CompareOrdinal(deviceName, "Test printer") != 0 && string.CompareOrdinal(deviceName, "A3 Printer") != 0)
            {
                return NotFound();
            }

            if (string.CompareOrdinal(deviceName, "default") == 0 )
            {
                return new DeviceSettings { PrinterName = "Test printer", IsDefault = true, PaperSizeName = "A4" };
            }

            return new DeviceSettings { PrinterName = deviceName, PaperSizeName = "A5",
                Forms = new string[] { "A3", "A4", "A5" },
                Bins = new string[] { "Upper", "Lower" },
                Attributes = 1,
                Collate = BooleanOption.False,
                Duplex = Duplex.Default,
                IsLocal = true,
                PaperSourceName = "Upper",
                Status = 0,
                Copies = 1,
            };
        }

        /// <summary>
        /// Obtain the default settings for printing html, default device info and list of available device names
        /// </summary>
        /// <remarks>
        /// - requires basic license
        /// - units parameter will always be interpreted as 'Default' unless license is advanced 
        /// </remarks>
        /// <param name="units"></param>
        /// <returns></returns>
        /// GET api/v1/printhtml/htmlPrintDefaults
        [Route("htmlPrintDefaults/{units?}")]
        [Produces("application/json")]
        public ActionResult<PrintHtmlDefaultSettings> GetHtmlPrintDefaults(MeasurementUnits units = MeasurementUnits.Default)
        {
            _logger.LogInformation("GET api/v1/printhtml/htmlPrintDefaults/{units}", units);
            if (!HandleAuthentication())
            {
                return Unauthorized();
            }

            return new PrintHtmlDefaultSettings {
                AvailablePrinters = new string[] { "A3 Printer", "Test printer" },

                Device = new DeviceSettings { PrinterName = "Test printer", IsDefault = true, PaperSizeName = "A4",
                    Forms = new string[] { "A3", "A4", "A5" },
                    Bins = new string[] { "Upper", "Lower" },
                    Attributes = 1,
                    Collate = BooleanOption.False,
                    Duplex = Duplex.Default,
                    IsLocal = true,
                    PaperSourceName = "Upper",
                    Status =0,
                    Copies = 1 },

                Settings = new HtmlPrintSettings
                {
                    Header = "Default header from server",
                    Footer = "Default footer from server",
                    Page = new PageSettings { Orientation = PageOrientation.Landscape, Margins= { Bottom = "1", Left="1", Right="2",Top="2" }, Units = MeasurementUnits.Inches},
                    ViewScale = -1,
                    PrintBackgroundColorsAndImages = BooleanOption.True
                }
            }; 
        }

        /// <summary>
        /// Print html content with given html and device settings
        /// </summary>
        /// <remarks>
        /// Use of some features may require a license which will be checked 
        /// - requires basic license for InnerHTML content type
        /// - requires advanced license for URL content type, specified page margin units, specified background setting, print scale, page range
        /// </remarks>
        /// <param name="requestMessage"></param>
        /// <returns></returns>
        // POST api/v1/printHtml/print
        [Route("print")]
        [Produces("application/json")]
        public ActionResult<Print> PostPrint([FromBody] PrintHtmlDescription requestMessage)
        {
            _logger.LogInformation("POST api/v1/printHtml");

            if (!HandleAuthentication())
            {
                return Unauthorized();
            }

            if (requestMessage == null)
            {
                throw new ArgumentNullException(nameof(requestMessage));
            }

            if (requestMessage.Settings == null)
            {
                //throw new ArgumentNullException(nameof(requestMessage), "Html options are required.");
                requestMessage.Settings = new HtmlPrintSettings();
            }

            // in the basic use case, client may not send any device settings. 
            if (requestMessage.Device == null)
            {
                requestMessage.Device = new DevicePrintSettings();
            }

            var printer = requestMessage.Device.PrinterName;

            if (printer == null)
            {
                throw new ArgumentException("Printer not available", nameof(requestMessage.Device.PrinterName));
            }

            Print printResponse = new Print { Status = PrintRequestStatus.QueuedToDevice, JobIdentifier = requestMessage.ContentType.ToString(), Message="No message" };

            if (requestMessage.ContentType != ContentType.Html && requestMessage.ContentType != ContentType.InnerHtml && requestMessage.ContentType != ContentType.Url )
            {
                printResponse.Status = PrintRequestStatus.SoftError;
                printResponse.JobIdentifier = "";
                printResponse.Message = $"Unsupported print content type: {requestMessage.ContentType}"; 
            }

            counter = 0;
            _logger.LogInformation("Returning {status} [{message}], jobToken: {token}", printResponse.Status, printResponse.Message, printResponse.JobIdentifier);

            return printResponse;
        }

        // Get api/v1/printHtml/status/{jobIdentifier}
        /// <summary>
        /// Get the status of the job with the given id
        /// </summary>
        /// <remarks>
        /// This is advanced info so requires an advanced license, 
        /// without it responses will be throttled to 'real' value once per n seconds 
        /// (see call Job definition for value)
        /// </remarks>
        /// <param name="jobIdentifier"></param>
        /// <returns></returns>
        [Route("status/{jobToken}")]
        [Produces("application/json")]
        public ActionResult<JobStatus> GetStatus(string jobToken)
        {
            JobStatus js = new JobStatus(jobToken);
            _logger.LogInformation("Status of job {jobToken} is {status} [{message}]", jobToken, js.Status, js.Message);
            if (!HandleAuthentication())
            {
                return Unauthorized();
            }

            ContentType cType;

            if (Enum.TryParse<ContentType>(jobToken, true, out cType))
            {
                switch ( cType )
                {
                    case ContentType.InnerHtml:
                        js.Status = PrintHtmlStatus.Completed;
                        break;

                    case ContentType.Url:
                        js.Status = PrintHtmlStatus.Abandoned;
                        js.Message = "Mocked abandon";
                        break;

                    case ContentType.Html:
                        js.Status = ++counter < 3 ? PrintHtmlStatus.Printing : PrintHtmlStatus.Completed;
                        break;

                    default:
                        js.Status = PrintHtmlStatus.ItemError;
                        js.Message = "Bad type from jobToken: " + jobToken;
                        break;
                }
            }
            else
            {
                js.Status = PrintHtmlStatus.ItemError;
                js.Message = "Bad Html print jobToken";
            }

            return js;
        }

        /// <summary>
        /// Deliver the pdf output for the job.
        /// </summary>
        /// <remarks>
        /// - requires basic license
        /// </remarks>
        /// TODO: Should check that the jobId was for the caller otherwise we 
        /// risk leaking confidential info - someone can grab the print output 
        /// intended for someone else if they know the jobId (an approach here is
        /// to obfusticate the jobId).
        /// 
        /// Note that this is called by the client side frame work with a window.open call
        /// so we have no referer and no ajax origin so we have to disable all checks.
        /// <param name="jobIdentifier"></param>
        /// <returns></returns>
        [Route("download/{jobToken}")]
        [ProducesResponseType(200, Type = typeof(PhysicalFileResult))]
        public IActionResult GetDownloadPrint(string jobToken) // Dont attempt to update to ActionResult<PhysicalFileResult> - it wont work
        {
            return NotFound();
        }

        private bool HandleAuthentication()
        {
            return _mockAuthentication.CheckAuthorized();
        }
    }
}
