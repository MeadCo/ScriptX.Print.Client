using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ScriptX.Services_Client.Authentication
{
    public interface IMockAuthentication
    {
        bool CheckAuthorized();
        MeadCo.ScriptX.Print.Messaging.Responses.License License { get; }
    }
}
