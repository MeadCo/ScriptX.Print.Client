using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ScriptX.Print.Client.Models
{
    public class Sample
    {
        public Sample(string title)
        {
            Title = title;
        }
        public string Title { get; set; }
        public string License => "13598d2f-8724-467b-ae64-6e53e9e9f644";

        public string ClientLicense => "C4DB5D29-BE52-46B9-9DDF-46A167170F81";

        public int ClientRevision => 4;

        public string ClientPath => "warehouse";
    }
}