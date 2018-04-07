using BH.Attributes;
using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace BH.Api
{
    [RESTAuthorize]
    public class HomeController : ApiController
    {
        private Entities db = new Entities();

        public async Task<IHttpActionResult> GetUserAccount(string user)
        {
            try
            {
                UserAccount userAccount = await db.UserAccounts.Where(u => u.UserLogin == user).FirstOrDefaultAsync();
                userAccount.UserPassword = null; //Never send the Password over the web (we're using TOKEN!)
                return Ok(userAccount);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        public async Task<IHttpActionResult> Put(UserAccount uAccountToEdit)
        {
            try
            {
                string password = UserAccountUtility.getUserPassword(uAccountToEdit.UserLogin);
                uAccountToEdit.UserPassword = password;  //Pswd is not sent at client-side, Put the same Password stored in the DB
                db.Entry(uAccountToEdit).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Ok("User Updated!");
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        //public async Task<IHttpActionResult> Put(String uLogin,String uName, Boolean uAutoRefresh,int uAutoRefreshInterval)
        //{
        //    try
        //    {
        //        UserAccount userAccount = await db.UserAccounts.Where(u => u.UserLogin == uLogin).FirstOrDefaultAsync();
        //        userAccount.UserName = uName;
        //        userAccount.pref_autorefreshEnabled = uAutoRefresh;
        //        userAccount.pref_autorefreshInterval = uAutoRefreshInterval;
        //        db.Entry(userAccount).State = EntityState.Modified;
        //        await db.SaveChangesAsync();

        //        UserAccount userAccountUpdated = await db.UserAccounts.Where(u => u.UserLogin == uLogin).FirstOrDefaultAsync();
        //        userAccountUpdated.UserPassword = null; //Never send the Password over the web (we're using TOKEN!)
        //        return Ok(userAccountUpdated); //Object is Needed to refresh the view. "User data saved."
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest("Error: " + ex.GetBaseException().Message);
        //    }
        //}

        [Route("api/Home/PutLogin")]
        public async Task<IHttpActionResult> PutLogin(string userLogin, DateTime dateTime)
        {
            try
            {
                var user =await db.UserAccounts.Where(u => u.UserLogin == userLogin).FirstOrDefaultAsync();
                user.IsLoggedIn = true;
                user.LoggedInAt = dateTime;
                await db.SaveChangesAsync();
                return Ok("User data has been updated successfuly."); //Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }

        [Route("api/Home/PutLogOut")]
        public async Task<IHttpActionResult> PutLogOut(string userLogin, DateTime dateTime)
        {
            try
            {
                var user = await db.UserAccounts.Where(u => u.UserLogin == userLogin).FirstOrDefaultAsync();
                user.IsLoggedIn = false;
                user.LoggedOutAt = dateTime;
                await db.SaveChangesAsync();
                return Ok("User data has been updated successfuly."); //Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.GetBaseException().Message);
            }
        }
    }
}
