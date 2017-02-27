using System;
using System.Security.Principal;
using ScriptX.Print.Client.Attributes;

namespace ScriptX.Print.Client.Identity
{
    public class ApiIdentity : IIdentity
    {
        public LicenseDetail License
        {
            get;
            private set;
        }
        public ApiIdentity(LicenseDetail license)
        {
            if (license == null) throw new ArgumentNullException("license");
            this.License = license;
        }

        public string Name => License.Id;

        public string AuthenticationType => "Basic";

        public bool IsAuthenticated => true;
    }
}