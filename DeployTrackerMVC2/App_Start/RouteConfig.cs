using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace DeployTrackerMVC2
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "NewDeploy",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Forms", action = "NewDeploy", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Developer",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Developer", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
