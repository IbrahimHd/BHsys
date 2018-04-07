using BH.Attributes;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;

namespace BH.Api
{
    [RESTAuthorize]
    public class supplierController : ApiController
    {
        private Entities db = new Entities();

        public async Task<IHttpActionResult> get() /*Task<List<Supplier>>*/
        {
            try
            {
                Supplier [] supplier = await db.Suppliers
                                            .ToArrayAsync();
                if (supplier != null)
                {
                    return Content(HttpStatusCode.OK, supplier);
                }
                else
                {
                    return BadRequest("No records not found.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        public async Task<IHttpActionResult> get(int id) /*Task<List<Supplier>>*/
        {
            try
            {
                Supplier supplier = await db.Suppliers
                                    .Where(s => s.supplierId.Equals(id) // || IdOrName==null 
                                           )
                                    .FirstOrDefaultAsync();
                if (supplier != null)
                {
                    return Content(HttpStatusCode.OK, supplier);
                }
                else
                {
                    return BadRequest("Record not found.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        //Find suppliers by Name
        [HttpGet]
        [Route("api/supplier/findSupplier")]
        public async Task<IHttpActionResult> findSupplier(string idOrName) /*Task<List<Supplier>>*/
        {
            try
            {
                List<Supplier> suppliers = await db.Suppliers
                                    .Where(s => s.supplierName.Contains(idOrName) // ||  s.supplierId.Equals(idOrName) //IdOrName==null || 
                                           )
                                    .ToListAsync();

                return Ok(suppliers);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        public async Task<IHttpActionResult> Post(Supplier supplierToAdd)
        {
            try
            {
                supplierToAdd.createdAt = DateTime.Now;

                //if (isSupplierExist(supplierToAdd.supplierName))
                //{
                //    return Content(HttpStatusCode.NotAcceptable, supplierToAdd.supplierName);
                //}
                //else
                //{
                    db.Suppliers.Add(supplierToAdd);
                    await db.SaveChangesAsync();
                    return Content(HttpStatusCode.OK, supplierToAdd);
                //}
            }
            catch (Exception ex)
            {
                if (ex.GetBaseException().Message.Contains("duplicate")) return Content(HttpStatusCode.NotAcceptable,"Error: " + ex.GetBaseException().Message);
                else return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        //public async Task<IHttpActionResult> Put(JObject joParam )
        //{
        //    dynamic dParam= joParam;
        //    JObject jSupplier = dParam.supplierToEdit;

        //    var supplierToEdit = jSupplier.ToObject<Supplier>();
        //    Boolean isDeleted=false;
        //    if (joParam.GetType().GetProperty("isDeleted") != null) isDeleted = true;  // property checking is not working as expected
        //    isDeleted= dParam.isDeleted;
        public async Task<IHttpActionResult> Put(Supplier supplierToEdit)
        {
            try
            {
                if (supplierToEdit == null) //no data has been sent
                {
                    var errMsg = new
                    {
                        Message = "No data has been received or the data format is not recognized."
                    };
                    return Content(HttpStatusCode.BadRequest, errMsg);
                }
                else
                {
                    // check if same name already exist (and make sure it's not the same supplier)
                    Supplier supplierInDB = supplierByName(supplierToEdit.supplierName);
                    if (supplierInDB != null && supplierInDB.supplierId != supplierToEdit.supplierId) //same name already exist
                    {
                        var errMsg = new
                        {
                            Message = "Supplier name '" + supplierToEdit.supplierName + "' is already exist!"
                        };
                        return Content(HttpStatusCode.NotAcceptable, errMsg);
                    }
                    else //Supplier Name is OK, NO duplicate
                    {
                        if (supplierToEdit.isDeleted == supplierInDB.isDeleted)/* Is the action is "edid"?, not "remove" nor "restore" */
                        {
                            supplierToEdit.modifiedAt = DateTime.Now;
                        }
                        else// it's a "remove" or "restore" action
                        {
                            //
                        }
                    
                        db.Entry(supplierToEdit).State = EntityState.Modified;                
                        try
                        {
                            await db.SaveChangesAsync();
                            return Content(HttpStatusCode.OK, supplierToEdit); //var result = isDeleted ? itemId + " removed." : item;
                        }
                        catch (DbUpdateConcurrencyException dbEx)
                        {
                            //throw;
                            return BadRequest("Error: " + dbEx.GetBaseException().Message);
                        }
                        finally
                        {

                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }


        [Route("api/supplier/getSummary")]
        public async Task<IHttpActionResult> getSummary() /*Task<List<Supplier>>*/
        {
            try
            {
                var supplierSummaries = await db.vSupplierSummaries
                                            .ToArrayAsync();
                if (supplierSummaries != null)
                {
                    return Content(HttpStatusCode.OK, supplierSummaries);
                }
                else
                {
                    return BadRequest("No records found.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        public static bool isSupplierExist(string searchText)
        {
            try
            {
                Entities db = new Entities();

                Supplier supplier = db.Suppliers
                                    .Where(s => s.supplierName == searchText)
                                    .FirstOrDefault();

                return supplier != null;
            }
            catch (Exception ex)
            {
              //return "Error: " + ex.GetBaseException().Message;
                return true; //<< has to be "null"
            }
        }

        public static Supplier supplierByName(string searchText)
        {
            Supplier supplier = new Supplier();
            try
            {
                Entities db = new Entities();
                supplier = db.Suppliers
                                    .Where(s => s.supplierName == searchText)
                                    .FirstOrDefault();

                return supplier;
            }
            catch (Exception ex)
            {
                //return "Error: " + ex.GetBaseException().Message;
                return supplier; //<< has to be "null"
            }
        }
    }

}
