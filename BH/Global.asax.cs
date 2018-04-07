using System.Web.Http;
using System.Net.Http.Formatting;

namespace BH
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);

            GlobalConfiguration.Configuration.Formatters.Add(new JsonMediaTypeFormatter());
            var json = GlobalConfiguration.Configuration.Formatters.JsonFormatter;
            json.SerializerSettings.PreserveReferencesHandling = Newtonsoft.Json.PreserveReferencesHandling.Objects;
            json.SerializerSettings.Formatting = Newtonsoft.Json.Formatting.Indented;

            /*
             * Web Api returning empty json results with “$ref=”
             * Serializing Circular References with JSON.Net and Entity Framework
             *  http://johnnycode.com/2012/04/10/serializing-circular-references-with-json-net-and-entity-framework/
            */
            //var jsonSerializerSettings = new JsonSerializerSettings
            //{
            //    PreserveReferencesHandling = PreserveReferencesHandling.Objects
            //};

            //GlobalConfiguration.Configuration.Formatters.Clear();
            //GlobalConfiguration.Configuration.Formatters.Add(new JsonNetFormatter(jsonSerializerSettings));
        }
    }
}
