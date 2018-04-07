using System;
using System.Diagnostics;
using System.Linq;

namespace BH.Api
{
    public class UserAccountUtility
    {
        public static string getUserPassword(string login)
        {
            try
            {
                Entities db = new Entities();
                UserAccount userAccount = db.UserAccounts.Where(u => u.UserLogin == login).FirstOrDefault();
                Debug.WriteLine(userAccount.UserPassword);
                return userAccount.UserPassword;
            }
            catch (Exception ex)
            {
                throw ex.GetBaseException();
                //return "Error: " + ex.GetBaseException().Message;
            }

        }
    }
}