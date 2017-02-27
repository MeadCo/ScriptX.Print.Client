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
    }
}