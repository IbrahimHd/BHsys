using BH.Attributes;
using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Diagnostics;
using System.Linq;
using System.Linq.Dynamic;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;

namespace BH.Api
{
    [RESTAuthorize]
    public class receiptController : ApiController
    {
        private Entities db = new Entities();

        [HttpGet]
        public async Task<IHttpActionResult> get(int receiptId)
        {
            try
            {
                //db.Configuration.LazyLoadingEnabled = false;
                //db.Configuration.ProxyCreationEnabled = false;
                var receipt = await db.Receipts
                                    .Where(r => r.receiptId.Equals(receiptId))
                                    .Select( r => new
                                     {
                                                r.receiptId,
                                                r.receiptDate,
                                                r.supplierId,
                                                r.Supplier.supplierName,
                                                r.createdAt,r.createdBy,r.modifiedAt,r.modifiedBy,
                                                ReceiptItems = r.ReceiptItems
                                                                        .Select(
                                                                            ReceiptItem => new
                                                                                {
                                                                                    ReceiptItem.itemId,
                                                                                    ReceiptItem.receiptId,
                                                                                    ReceiptItem.Item.itemName,
                                                                                    ReceiptItem.itemPackage,
                                                                                    ReceiptItem.itemPackageCount,
                                                                                    ReceiptItem.itemPackageDeposit,
                                                                                    ReceiptItem.itemLandingCost,
                                                                                    ReceiptItem.itemFreight,
                                                                                    ReceiptItem.itemQnty,
                                                                                    ReceiptItem.itemCost,
                                                                                    ReceiptItem.createdAt,
                                                                                    ReceiptItem.createdBy,
                                                                                    ReceiptItem.modifiedAt,
                                                                                    ReceiptItem.modifiedBy
                                                                                }
                                                                        )
                                            }
                                    )
                                    .FirstOrDefaultAsync();

                if (receipt != null)
                {
                    return Ok(receipt);
                }
                else
                {
                    return BadRequest("Faild, Receipt #" + receiptId + " not found.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        [HttpGet]
        [Route("api/receipt/GetPagedFilteredReceipts")]
        public async Task<IHttpActionResult> GetPagedFilteredReceipts(string orderBy, string filterBy = "true", string filterByFields = "true", DateTime? dFrom = null, DateTime? dTo = null, int pageSize = 25, int pageFrom = 1)
        {
            try
            {
                int skipRecords = pageFrom > 1 ? (pageFrom - 1) * pageSize : 0;

                int recordCount = await db.vReceiptSummaries
                                        .Where(r => r.receiptDate >= dFrom || dFrom == null)
                                        .Where(r => r.receiptDate <= dTo || dTo == null)
                                        .Where(filterByFields) //filter by all 'available' Fields, tbl header, using "AND" orerator
                                        .Where(filterBy) // Search box, using "OR" operator
                                        .CountAsync();
                                  
                                  //db.Database.SqlQuery<spReceiptSummary_Result>("spReceiptSummary")
                var records = await db.vReceiptSummaries
                                    .Where(r => r.receiptDate >= dFrom || dFrom == null)
                                    .Where(r => r.receiptDate <= dTo || dTo == null)
                                    .Where(filterByFields) //filter by all 'available' Fields, tbl header, using "AND" operator
                                    .Where(filterBy) // Search box, using "OR" operator
                                    .OrderBy(orderBy)
                                    .Skip(skipRecords)
                                    .Take(pageSize)
                                    .ToListAsync();
                return Ok(new { records = records, pageSize = pageSize, pageFrom = pageFrom, recordCount = recordCount });
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        [HttpGet]
        [Route("api/receipt/removedList")]
        public async Task<IHttpActionResult> removedList()
        {
            try
            {
                var receipts = await db.Receipts
                                    .Where(r => r.isDeleted == true)
                                    .Select(r => new
                                    {
                                        r.receiptId,
                                        r.receiptDate,
                                        r.supplierId,
                                        r.Supplier.supplierName,
                                        r.createdAt,
                                        r.createdBy,
                                        r.modifiedAt,
                                        r.modifiedBy,
                                        ReceiptItems = r.ReceiptItems
                                                                       .Select(
                                                                           ReceiptItem => new
                                                                           {
                                                                               ReceiptItem.itemId,
                                                                               ReceiptItem.receiptId,
                                                                               ReceiptItem.Item.itemName,
                                                                               ReceiptItem.itemPackage,
                                                                               ReceiptItem.itemPackageCount,
                                                                               ReceiptItem.itemPackageDeposit,
                                                                               ReceiptItem.itemLandingCost,
                                                                               ReceiptItem.itemFreight,
                                                                               ReceiptItem.itemQnty,
                                                                               ReceiptItem.itemCost,
                                                                               ReceiptItem.createdAt,
                                                                               ReceiptItem.createdBy,
                                                                               ReceiptItem.modifiedAt,
                                                                               ReceiptItem.modifiedBy
                                                                           }
                                                                       )
                                    }
                                    )
                                    .ToListAsync();

                if (receipts != null)
                {
                    return Content(HttpStatusCode.OK, receipts);
                    //return Ok(receipts);
                }
                else
                {
                  //return Content(HttpStatusCode.BadRequest, "Any object");
                    return BadRequest("Faild, no records found.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        //add Receipt
        [HttpPost]
        public async Task<IHttpActionResult> Post(Receipt receipt) //JObject JSONuserLoginAndReceipt
           
        {
            try
            {  
                int supplierId = receipt.supplierId;
                receipt.createdAt = DateTime.Now;

                if (receipt.ReceiptItems.Count() > 0)
                {
                    receipt.createdAt = DateTime.Now;
                    //receipt.createdBy = user; <<Couldn't manage get it works, don't know now to playload both Receipt & User in JSON
                    foreach (ReceiptItem receiptItem in receipt.ReceiptItems)
                    {
                        receiptItem.createdAt = DateTime.Now;
                        //receiptItem.createdBy = user; <<Couldn't manage get it works, don't know now to playload both Receipt & User in JSON
                    }
                    
                    db.Receipts.Add(receipt);
                    await db.SaveChangesAsync();
                    return Ok("Successful, Receipt #" + receipt.receiptId + " added.");
                }
                else
                {
                    return BadRequest("The Receipt has no items.");
                }
            }
            catch (Exception ex)
            //catch (System.Data.Entity.Validation.DbEntityValidationException ex)
            {
                //    var sb = new System.Text.StringBuilder();
                //    foreach (var failure in ex.EntityValidationErrors)
                //    {
                //        sb.AppendFormat("- Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", failure.Entry.Entity.GetType().FullName, failure.Entry.State);
                //        foreach (var error in failure.ValidationErrors)
                //        {
                //            sb.AppendFormat("-- Property: \"{0}\", Value: \"{1}\", Error: \"{2}\"",
                //                error.PropertyName,
                //                failure.Entry.CurrentValues.GetValue<object>(error.PropertyName),
                //                error.ErrorMessage);
                //            sb.AppendLine();
                //        }
                //    }
                //    return BadRequest("Error: " + new Exception(sb.ToString()));
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        //add Receipt
        //[HttpPost]
        //public async Task<IHttpActionResult> addReceipt(string[] receiptToAdd)
        //{
        //    HttpClient client = new HttpClient();

        //    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        //}

      //[AcceptVerbs("POST", "PUT")]
        public async Task<IHttpActionResult> Put(Receipt receiptToEdit)
        {
            try
            {
                receiptToEdit.modifiedAt = DateTime.Now;
                //receipt.modifiedBy = user; <<Couldn't manage get it works, don't know now to playload both Receipt & User in JSON

                db.Entry(receiptToEdit).State = EntityState.Modified;

                foreach (ReceiptItem receiptItem in receiptToEdit.ReceiptItems)
                {
                    //db.Entry(receiptItem).State = receiptItem.createdAt != null ? EntityState.Modified : EntityState.Added;

                    Debug.WriteLine("{0}-{1}-{2}-{3}", receiptItem.itemId,receiptItem.createdAt.ToString(), receiptItem.createdAt.ToString() == null, string.IsNullOrEmpty(receiptItem.createdAt.ToString()));

                    if (string.IsNullOrEmpty(receiptItem.createdAt.ToString())) //it's edit session but new item added
                    {
                        receiptItem.createdAt = DateTime.Now;
                        //receiptItem.createdBy = user; <<Couldn't manage get it works, don't know now to playload both Receipt & User in JSON
                        db.Entry(receiptItem).State = EntityState.Added;
                    }
                    else //receiptItem.changed == true (can't use this property)
                    {   //receiptItem.modifiedAt = DateTime.Now;  //<<<< without [.changed==true] this will apply to all records even if not updated
                        //receiptItem.modifiedBy = user; <<Couldn't manage get it works, don't know now to playload both Receipt & User in JSON
                        db.Entry(receiptItem).State = EntityState.Modified;
                    }
                }

                try
                {
                    await db.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException DbEx)
                {
                    throw DbEx;
                }
                return Ok("Saved: " + receiptToEdit);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        [Route("api/receipt/remove_restore")]
        public async Task<IHttpActionResult> Put(int receiptId, Boolean isDeleted = true)
        {
            try
            {
                Receipt receipt = await db.Receipts.Where(r => r.receiptId == receiptId)
                                                   .FirstOrDefaultAsync();

                if (receipt == null) return BadRequest(receiptId + " Not Found.");

                receipt.isDeleted = isDeleted;
                db.Entry(receipt).State = EntityState.Modified;

                try
                {
                    await db.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException DbEx)
                {
                    throw DbEx;
                }
                return Ok(receipt);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }
        public async Task<IHttpActionResult> Delete(int receiptIdToDelete)
        {
            try
            {
                Receipt receipt = await db.Receipts
                                            .Where(r => r.receiptId.Equals(receiptIdToDelete))
                                            .Include(r => r.ReceiptItems)
                                            .FirstOrDefaultAsync();
                if (receipt == null) return BadRequest(receiptIdToDelete + " Not Found.");

                db.Receipts.Remove(receipt);
                //db.Entry(receipt).State = EntityState.Deleted; << this does not delete related children records
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
               return Ok("deleted: " + receiptIdToDelete);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }
    }
}
