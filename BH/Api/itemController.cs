using BH.Attributes;
using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;

namespace BH.Api
{
    [RESTAuthorize]
    public class itemController : ApiController
    {
        private Entities db = new Entities();

        //Get specific
        [HttpGet]
        public async Task<IHttpActionResult> findItem(string strName)
        {
            try
            {
                var items = await db.Items
                                    .Where(i => i.itemName.Contains(strName) // ||  s.supplierId.Equals(IdOrName) //IdOrName==null || 
                                           )
                                    .ToListAsync();
                if (items.Count() > 0)
                {
                    return Ok(items);
                }
                else
                {
                    return Content(HttpStatusCode.NoContent, "No Records Found.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        //items most usually brought by the chosen Supplier
        [HttpGet]
        [System.Web.Http.Route("api/item/itemsOfSupplier")]
        public async Task<IHttpActionResult> itemsOfSupplier(int splrId)
        {
            try
            {
                var items = await db.vSupplierItems
                                    .Where(s => s.supplierId.Equals(splrId)
                                           )
                                    .ToListAsync();
                if (items.Count() > 0)
                {
                    return Ok(items);
                }
                else
                {
                    return Content(HttpStatusCode.NotFound, "No Records Found."); //BadRequest("No Records Found.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        public async Task<IHttpActionResult> Post(Item itemToAdd)
        {
            try
            {
                itemToAdd.createdAt = DateTime.Now;
                db.Items.Add(itemToAdd);

                try
                {
                    await db.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException DbEx)
                {
                    throw DbEx;
                }
                return Ok(itemToAdd);
            }
            catch (Exception ex)
            {
                if (ex.GetBaseException().Message.Contains("duplicate")) return Content(HttpStatusCode.NotAcceptable, "Error: " + ex.GetBaseException().Message);
                else return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        public async Task<IHttpActionResult> Put(Item itemToEdit)
        {
            try
            {
                itemToEdit.modifiedAt = DateTime.Now;

                db.Entry(itemToEdit).State = EntityState.Modified;

                try
                {
                    await db.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException DbEx)
                {
                    throw DbEx;
                }
                return Ok(itemToEdit);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        public async Task<IHttpActionResult> Delete(int itemIdToDelete)
        {
            try
            {
                Item item = await db.Items.Where(r => r.itemId == itemIdToDelete)
                                             .FirstOrDefaultAsync();
                if (item == null) return BadRequest(itemIdToDelete + " Not Found.");

                db.Entry(item).State = EntityState.Deleted;
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
                return Ok("deleted: " + itemIdToDelete);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        [Route("api/item/remove_restore")]
        public async Task<IHttpActionResult> Put(int itemId, Boolean isDeleted = true)
        {
            try
            {
                Item item = await db.Items.Where(r => r.itemId == itemId)
                                             .FirstOrDefaultAsync();
                if (item == null) return BadRequest(itemId + " Not Found.");

                item.isDeleted = isDeleted;

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
              //var result = isDeleted ? itemId + " removed." : item;
                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }
    }
}
