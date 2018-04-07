using BH.Attributes;
using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Diagnostics;
using System.Linq;
using System.Linq.Dynamic;
using System.Threading.Tasks;
using System.Web.Http;

namespace BH.Api
{
    [RESTAuthorize]
    public class receiptItemController : ApiController
    {
        private Entities db = new Entities();

        //Delete ReceiptItem
        public async Task<IHttpActionResult> Delete(int receiptItem_rId, int receiptItem_iId)
        {
            try
            {
                ReceiptItem receiptItem = await db.ReceiptItems
                                            .Where(ri => ri.receiptId.Equals(receiptItem_rId) && ri.itemId.Equals(receiptItem_iId))
                                            .FirstOrDefaultAsync();
                if (receiptItem == null) return BadRequest("ReceiptItem:" + receiptItem_rId + "/" + receiptItem_iId + " Not Found.");

                db.Entry(receiptItem).State = EntityState.Deleted;
                try
                {
                    await db.SaveChangesAsync();
                }
               
                catch (DbUpdateConcurrencyException)
                {
                    throw;
                }
                finally {
                    
                }
               return Ok("deleted: " + receiptItem_rId + "/" + receiptItem_iId);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        [Route("api/receiptItem/remove_restore")]
        public async Task<IHttpActionResult> Put(int receiptItem_rId, int receiptItem_iId, Boolean isDeleted = true)
        {
            try
            {
                ReceiptItem receiptItem = await db.ReceiptItems
                                            .Where(ri => ri.receiptId==receiptItem_rId && ri.itemId==receiptItem_iId)
                                            .FirstOrDefaultAsync();
                if (receiptItem == null) return BadRequest("ReceiptItem:" + receiptItem_rId + "/" + receiptItem_iId + " Not Found.");

                receiptItem.isDeleted = isDeleted;
                
                try
                {
                    await db.SaveChangesAsync();
                }

                catch (DbUpdateConcurrencyException)
                {
                    throw;
                }
                finally
                {

                }
                return Ok(receiptItem); //Ok("Removed: " + receiptItem_rId + "/" + receiptItem_iId);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }
    }
}
