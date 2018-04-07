using BH.Attributes;
using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace BH.Api
{
    [RESTAuthorize]
    public class commonController : ApiController
    {
        private Entities db = new Entities();

        [HttpGet]
        [Route("api/common/packageTypes")]
        public async Task<IHttpActionResult> packageTypes()
        {
            try
            {
                var packageTypes = await db.PackageTypes.Select(p => p.pkgType).ToListAsync();
                return Ok(packageTypes);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }
    }
}
