using System.Web.Http;
using Newtonsoft.Json.Serialization;

namespace ScriptX.Print.Server
{
    public static class JsonConfig
    {
        public static void Configure()
        {
            var formatters = GlobalConfiguration.Configuration.Formatters;
            var jsonFormatter = formatters.JsonFormatter;
            var settings = jsonFormatter.SerializerSettings;

            settings.ContractResolver = new CamelCasePropertyNamesContractResolver();
        }
    }
}