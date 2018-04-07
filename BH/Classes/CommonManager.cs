using System.Web;

namespace BH.Classes
{
    public static class CommonManager
    {
        private const string HttpContext = "MS_HttpContext";
        private const string RemoteEndpointMessage = "System.ServiceModel.Channels.RemoteEndpointMessageProperty";
        private const string OwinContext = "MS_OwinContext";

        public static string GetClientIp(HttpRequest request) //GetClientIp(HttpRequestBase request)
        {
            //Web-hosting
            string _HttpContext = request.Headers[HttpContext];
            if (string.IsNullOrEmpty(_HttpContext))
            {
                dynamic ctx = request.Headers[HttpContext];
                if (ctx != null)
                {
                    return ctx.Request.UserHostAddress;
                }
            }
            //Self-hosting
            string _RemoteEndpointMessage = request.Headers[RemoteEndpointMessage];
            if (string.IsNullOrEmpty(_RemoteEndpointMessage))
            {
                dynamic remoteEndpoint = request.Headers[RemoteEndpointMessage];
                if (remoteEndpoint != null)
                {
                    return remoteEndpoint.Address;
                }
            }
            //Owin-hosting
            string _OwinContext = request.Headers[OwinContext];
            if (string.IsNullOrEmpty(_OwinContext))
            {
                dynamic ctx = request.Headers[OwinContext];
                if (ctx != null)
                {
                    return ctx.Request.RemoteIpAddress;
                }
            }
            if (System.Web.HttpContext.Current != null)
            {
                return System.Web.HttpContext.Current.Request.UserHostAddress;
            }
            // Always return all zeroes for any failure
            return "0.0.0.0";
        }
    }
}