using System.Web.Http;
using BH.Classes;
using System;
using System.Net;

namespace BH.Api
{
    public class IpController : ApiController
    {
        [HttpGet]
        public IHttpActionResult GetIp()
        {
            try
            {
                System.Web.HttpContext c = System.Web.HttpContext.Current;
                return Content(HttpStatusCode.OK, CommonManager.GetClientIp(c.Request));
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.BadRequest, "Error: " + ex.GetBaseException().Message);
            }
        }
    }
}