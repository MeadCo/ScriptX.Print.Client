using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MeadCo.ScriptX.Print.Messaging;
using MeadCo.ScriptX.Print.Messaging.Responses;

namespace ScriptX.Services_Client.Controllers
{
    [Route("api")]
    [ApiController]
    public class ServiceDescriptionController : ControllerBase
    {
        private ILogger _logger;

        public ServiceDescriptionController(ILogger<ServiceDescriptionController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Return descriptive detail about the license in use (obtained from the authorization header)
        /// </summary>
        /// <returns>License detail</returns>
        // GET api/v1/licensing
        //
        [Route("")]
        [HttpGet]

        public ActionResult<ServiceDescription> Get() => new ServiceDescription()
        {
            ServiceClass = MeadCo.ScriptX.Print.Messaging.Models.ServiceClass.WindowsPC,
            CurrentAPIVersion = "v1",
            ServerVersion = new Version(10, 1, 2, 3),
            ServiceVersion = new Version(11, 12, 13, 14),
            ServiceUpgrade = new Version(),
            PrintDIRECT = false,
            PrintPDF = true,
            PrintHTML = true,
            AvailablePrinters = new string[] { "A3 Printer", "Test printer" }
        };

    }
}