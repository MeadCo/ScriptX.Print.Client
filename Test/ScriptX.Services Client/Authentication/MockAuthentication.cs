using MeadCo.ScriptX.Print.Messaging.Responses;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace ScriptX.Services_Client.Authentication
{
    public class MockAuthentication : IMockAuthentication
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const string AuthorizationHeaderName = "Authorization";
        private const string BasicSchemeName = "Basic";

        private static Guid TestValidGuid = new Guid("{666140C4-DFC8-435E-9243-E8A54042F918}");

        private License _license;

        public License License => _license;

        public MockAuthentication(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _license = null;
        }

        public bool CheckAuthorized()
        {
            if (AuthenticationHeaderValue.TryParse(_httpContextAccessor.HttpContext.Request.Headers[AuthorizationHeaderName], out AuthenticationHeaderValue headerValue))
            {
                if (BasicSchemeName.Equals(headerValue.Scheme, StringComparison.OrdinalIgnoreCase))
                {
                    byte[] headerValueBytes = Convert.FromBase64String(headerValue.Parameter);
                    string guidValue = Encoding.UTF8.GetString(headerValueBytes);
                    if (guidValue.Contains(':'))
                    {
                        guidValue = guidValue.Split(':')[0];
                    }

                    Guid guid;

                    if ( Guid.TryParse(guidValue,out guid) && guid.Equals(TestValidGuid) )
                    {
                        _license = new License { Company = "MeadCo", Guid = new Guid(guidValue), Options = new LicenseOptions { AdvancedPrinting = true } };
                    }
                }
            }

            return _license != null;

        }
    }
}
