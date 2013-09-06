using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;

namespace xio.js
{
    /// <summary>
    /// This is just a test support stuff for xio.spec.js which is the client-side unit tests for xio.js
    /// </summary>
    public class Global : System.Web.HttpApplication
    {

        protected void Application_Start(object sender, EventArgs e)
        {

            RegisterRoutes(RouteTable.Routes);
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.MapHttpRoute(
                "multi-param",
                "spec/svr/MultiParam/{param1}/{param2}/{param3}",
                new
                {
                    controller = "MultiParam",
                    param1 = RouteParameter.Optional,
                    param2 = RouteParameter.Optional,
                    param3 = RouteParameter.Optional
                });

            routes.MapHttpRoute(
                "cache invalidate",
                "spec/svr/{controller}/Invalidate",
                new
                {
                    action = "Invalidate"
                });

            routes.MapHttpRoute(
                "API Default",
                "spec/svr/{controller}/{key}",
                new
                    {
                        key = RouteParameter.Optional
                    });
        }

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {

        }
    }
}