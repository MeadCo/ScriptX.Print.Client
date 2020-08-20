using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using MeadCo.ScriptX.Print.Messaging.Requests;
using MeadCo.ScriptX.Print.Messaging.Responses;
using MeadCo.ScriptX.Print.Messaging.Models;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ScriptX.Services_Client.Authentication;

namespace ScriptX.Services_Client.Controllers
{
    [Route("api/v1/printdirect")]
    [ApiController]
    public class PrintDirectv1Controller : ControllerBase
    {
        private ILogger _logger;
        private IMockAuthentication _mockAuthentication;

        public PrintDirectv1Controller(ILogger<PrintDirectv1Controller> logger, IMockAuthentication mockAuthentication)
        {
            _logger = logger;
            _mockAuthentication = mockAuthentication;
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
        public ActionResult<Print> PostPrint([FromBody] PrintDirectDescription requestMessage)
        {
            _logger.LogInformation("POST api/v1/printDirect");

            if (!HandleAuthentication())
            {
                return Unauthorized();
            }

            if (requestMessage == null)
            {
                throw new ArgumentNullException(nameof(requestMessage));
            }

            var printer = requestMessage.PrinterName;

            if (printer == null)
            {
                throw new ArgumentException("A printer name must be given");
            }

            Print printResponse = new Print { Status = PrintRequestStatus.Ok, JobIdentifier = requestMessage.ContentType.ToString(), Message = "No message" };

            if (requestMessage.ContentType != ContentType.Html && requestMessage.ContentType != ContentType.InnerHtml && requestMessage.ContentType != ContentType.Url && requestMessage.ContentType != ContentType.String)
            {
                printResponse.Status = PrintRequestStatus.SoftError;
                printResponse.JobIdentifier = "";
                printResponse.Message = $"Unsupported print content type: {requestMessage.ContentType}";
            }
            else
            {
                if (printer != "My printer" && printer != "Test printer" )
                {
                    printResponse.Status = PrintRequestStatus.SoftError;
                    printResponse.JobIdentifier = "";
                    printResponse.Message = $"Printer not available: {printer}";
                }
            }

            _logger.LogInformation("Returning {status} [{message}], jobToken: {token}", printResponse.Status, printResponse.Message, printResponse.JobIdentifier);

            return printResponse;
        }

        private bool HandleAuthentication()
        {
            return _mockAuthentication.CheckAuthorized();
        }

    }
}