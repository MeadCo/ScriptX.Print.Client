using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MeadCo.ScriptX.Print.Messaging.Models;
using MeadCo.ScriptX.Print.Messaging.Requests;
using MeadCo.ScriptX.Print.Messaging.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ScriptX.Services_Client.Authentication;

namespace ScriptX.Services_Client.Controllers
{
    [Route("api/v1/printpdf")]
    [ApiController]
    public class PrintPDFv1Controller : ControllerBase
    {
        private ILogger _logger;
        private IMockAuthentication _mockAuthentication;

        private static int counter = 0;

        public PrintPDFv1Controller(ILogger<PrintPDFv1Controller> logger, IMockAuthentication mockAuthentication)
        {
            _logger = logger;
            _mockAuthentication = mockAuthentication;
        }

        /// <summary>
        /// Print pdf file with given print and device settings
        /// </summary>
        /// <param name="requestMessage"></param>
        /// <returns></returns>
        // POST api/v1/printpdf/print
        [Route("print")]
        [Produces("application/json")]
        public ActionResult<Print> PostPrint([FromBody] PrintPdfDescription requestMessage)
        {
            _logger.LogInformation("POST api/v1/printpdf");

            if (!HandleAuthentication())
            {
                return Unauthorized();
            }

            if (requestMessage == null)
            {
                throw new ArgumentNullException(nameof(requestMessage));
            }

            // requesting defaults on everything should not cause faults
            if (requestMessage.Settings == null)
            {
                requestMessage.Settings = new PdfPrintSettings();
            }

            if (requestMessage.Device == null)
            {
                requestMessage.Device = new DevicePrintSettings();
            }

            var printer = requestMessage.Device.PrinterName;

            if (printer == null)
            {
                throw new ArgumentException("Printer not available", nameof(requestMessage.Device.PrinterName));
            }

            string[] parsedQuery = requestMessage.Document.Query.Split('=');
            string jobId = parsedQuery.Length == 2 ? parsedQuery[1] : "pdf";

            Print printResponse = new Print { Status = PrintRequestStatus.QueuedToDevice, JobIdentifier = $"{jobId}:job", Message = "No message" };

            if (requestMessage.Document.IsUnc)
            {
                printResponse.Status = PrintRequestStatus.SoftError;
                printResponse.JobIdentifier = "";
                printResponse.Message = $"Unsupported print content type: Unc";
            }

            counter = 0;
            _logger.LogInformation("Returning {status} [{message}], jobToken: {token}", printResponse.Status, printResponse.Message, printResponse.JobIdentifier);

            return printResponse;
        }

        // Get api/v1/printpdf/status/{jobIdentifier}
        /// <summary>
        /// Get the status of the job with the given id
        /// </summary>
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

            string[] parts = jobToken.Split(':', StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length > 0 )
            {
                switch (parts[0])
                {
                    case "pdf0":
                        js.Status = PrintHtmlStatus.Completed;
                        break;

                    case "pdf1":
                        js.Status = PrintHtmlStatus.Abandoned;
                        js.Message = "Mocked abandon";
                        break;

                    case "pdf2":
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
                js.Message = "Bad PDF print jobToken";
            }

            return js;
        }

        /// <summary>
        /// Deliver the pdf output for the job.
        /// </summary>
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