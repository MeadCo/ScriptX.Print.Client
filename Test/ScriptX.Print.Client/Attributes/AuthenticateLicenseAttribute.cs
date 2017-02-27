using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Mvc;
using System.Web.UI.WebControls;
using ScriptX.Print.Client.Identity;
using ActionFilterAttribute = System.Web.Http.Filters.ActionFilterAttribute;

namespace ScriptX.Print.Client.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method,
     AllowMultiple = false)]
    public class AuthenticateLicenseAttribute : ActionFilterAttribute {

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if (actionContext.Request.Headers.Authorization == null)
            {
                actionContext.Response = new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized);
            }
            else
            {
                string authToken = actionContext.Request.Headers.Authorization.Parameter;
                string decodedToken = Encoding.UTF8.GetString(Convert.FromBase64String(authToken));
                string id = decodedToken.Substring(0, decodedToken.IndexOf(":", StringComparison.Ordinal));

                LicenseDetail licenseDetail = LicenseDetail.CreateLicense(id);

                if (licenseDetail != null)
                {
                    HttpContext.Current.User = new GenericPrincipal(new ApiIdentity(licenseDetail), new string[] { });
                    base.OnActionExecuting(actionContext);
                }
                else
                {
                    actionContext.Response = new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized);
                }
            }
        }
    }

}