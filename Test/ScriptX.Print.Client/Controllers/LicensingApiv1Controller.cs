using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using MeadCo.ScriptX.Print.Messaging.Responses;

namespace ScriptX.Print.Client.Controllers
{
    // this will come from messaging when we sync things up
    public class ClientLicense
    {
        public Guid Guid { get; set; }
        public string Url { get; set; }

        public int Revision { get; set; }
    }

    [RoutePrefix("api/v1/licensing")]

    public class LicensingApiv1Controller : ApiController
    {
        [Route("")]
        // GET api/v1/licensing
        //
        // Must be an authenticated and authorised request, return the license.
        // Not authenticated or authorised and an error has already occurred.
        //
        // The consequence is you cannot obtain the details of an expired license.
        //
        public IHttpActionResult Get(Guid? licenseGuid)
        {
            return Ok(new MeadCo.ScriptX.Print.Messaging.Responses.License
            {
                Guid = new Guid(),
                Company = "Test Company",
                CompanyHomePage = new Uri("http://www.meadroid.com"),
                From = DateTime.Today,
                To = DateTime.Now.AddDays(30),
                Options = new LicenseOptions(),
                Domains = new string[] {"Fred","Dave"}
            });
        }

        /// <summary>
        /// Install a client side license.
        /// </summary>
        /// <param name="license">Guid, path and revision of the license</param>
        /// <returns>Installed license detail</returns>
        // POST api/v1/licensing 
        //
        [Route("")]
        public IHttpActionResult Post(ClientLicense license)
        {
            License l = license.Revision >= 0 ? new MeadCo.ScriptX.Print.Messaging.Responses.License
            {
                Guid = license.Guid,
                Company = "Test Company",
                CompanyHomePage = new Uri("http://www.meadroid.com"),
                From = DateTime.Today,
                To = DateTime.Now.AddDays(30),
                Options = new LicenseOptions(),
                Domains = new string[] { "Fred", "Dave" }
            } : null; 

            if ( l != null ) return Ok(l);
            
            return BadRequest();
        }

        [Route("ping")]
        // GET api/v1/licensing/ping
        //
        // Simply test that the license is usable for something
        // returns enabled options.
        public IHttpActionResult GetPing(Guid? licenseGuid)
        {
            return Ok(new LicenseOptions());
        }

        // workflow here - create / renew / update license
        //  need contact details => integrate with my meadco too? Or customer store
    }
}
