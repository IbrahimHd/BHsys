using System;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using BH.Auth;
using System.Diagnostics;
using BH.Classes;
using System.Net.Http;

namespace BH.Attributes
{
    public class RESTAuthorizeAttribute : AuthorizeAttribute
    {
        private const string _securityToken = "token"; // Name of the url parameter.

        public override void OnAuthorization(HttpActionContext filterContext)
        {
            if (Authorize((HttpContextBase)filterContext.Request.Properties["MS_HttpContext"]))
            {
                return;
            }

            HandleUnauthorizedRequest(filterContext);
        }

        protected override void HandleUnauthorizedRequest(HttpActionContext filterContext)
        {
            base.HandleUnauthorizedRequest(filterContext);
        }

        private bool Authorize(HttpContextBase httpContext)//HttpActionContext actionContext
        {
            try
            {
                HttpRequestBase request = httpContext.Request;
                string token = request.Params[_securityToken];
                Debug.Write("Token received from the Client: " + token);

                return SecurityManager.IsTokenValid(token, CommonManager.GetClientIp(System.Web.HttpContext.Current.Request), request.UserAgent);
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}