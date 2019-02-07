using MeadCo.ScriptX.Print.Messaging.Requests;
using MeadCo.ScriptX.Print.Messaging.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ScriptX.Services_Client.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ScriptX.Services_Client.Controllers
{
    [Produces("application/json")]
    [Route("api/v1/licensing")]
    [ApiController]

    public class Licensev1Controller : ControllerBase
    {
        private const string MagicWarehouse = "warehouse";
        private const string WarehouseRootUrl = "http://licenses.meadroid.com";

        private ILogger _logger;
        private IMockAuthentication _mockAuthentication;

        public Licensev1Controller(ILogger<Licensev1Controller> logger,IMockAuthentication mockAuthentication)
        {
            _logger = logger;
            _mockAuthentication = mockAuthentication;
        }

        /// <summary>
        /// Return descriptive detail about the license in use (obtained from the authorization header)
        /// </summary>
        /// <returns>License detail</returns>
        // GET api/v1/licensing
        //
        [Route("")]
        [HttpGet]
        [ProducesResponseType(404)]
        [ProducesResponseType(400)]
        public ActionResult<License> Get()
        {
            if ( _mockAuthentication.CheckAuthorized() )
            {
                return _mockAuthentication.License;
            }

            return BadRequest();
        }

        /// <summary>
        /// Install a client side license.
        /// </summary>
        /// <param name="license">Guid, path and revision of the license</param>
        /// <returns>Installed license detail</returns>
        // POST api/v1/licensing 
        //
        [Route("")]
        [HttpPost]
        [AllowAnonymous] // they are wanting to specify the license to use.
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public ActionResult<License> Post([FromBody] ClientLicense license)
        {
            _logger.LogInformation("POST {guid}, url: {url}, revision: {rev}", license.Guid.ToString(), license.Url, license.Revision);

            License l = InstallAndGetClientLicenseDetail(license);

            if (l == null)
            {
                return BadRequest();
            }

            if ( license.Url == "Bad-Warehouse")
            {
                return NotFound();
            }

            return l;
        }

        [Route("ping")]
        [AllowAnonymous]
        // GET api/v1/licensing/ping
        //
        // Simply test that the license is usable for something
        // returns enabled options.

        public ActionResult<LicenseOptions> GetPing(Guid? licenseGuid)
        {
            _logger.LogInformation("GET Ping: {guid}", licenseGuid.HasValue ? licenseGuid.Value.ToString() : "No license supplied");
            if (licenseGuid.HasValue)
            {
                return new LicenseOptions { AdvancedPrinting = true  };
            }

            return new LicenseOptions();
        }

        private License InstallAndGetClientLicenseDetail(ClientLicense license)
        {
            if ( license.Guid.Equals(new Guid("{666140C4-DFC8-435E-9243-E8A54042F918}")) )
            {
                return new License {
                    Guid = new Guid("{666140C4-DFC8-435E-9243-E8A54042F918}"),
                    Company = "MeadCo",
                    CompanyHomePage = new Uri("http://www.meadroid.com"),
                    From = DateTime.Today,
                    To = DateTime.Today.AddMonths(3),
                    Options = new LicenseOptions
                    {
                        BasicHtmlPrinting = true,
                        AdvancedPrinting = true
                    },
                    Domains = new string[] { "meadroid.com", "meadco.com" }
                };
            }
            return null;
        }

    }
}
