using BH.Attributes;
using System;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;

namespace BH.Api
{
    [RESTAuthorize]
    public class companyController : ApiController
    {
        private Entities db = new Entities();

        [HttpGet]
        public async Task<IHttpActionResult> get() //get(user.companyName)
        {
            try
            {
              //Company companyInfo = await db.Companies.Where(c => c.CompanyName == User.companyName).FirstOrDefaultAsync();
                Company companyInfo = await db.Companies.FirstOrDefaultAsync();

                return Content(HttpStatusCode.OK, companyInfo);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.BadRequest, ex.GetBaseException().Message); //BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }
    }
}
