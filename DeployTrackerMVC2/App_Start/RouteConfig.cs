using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
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

            routes.MapRoute(
                name: "QA",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "QA", action = "Index", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Notes",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Notes", action = "Index", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "ChangeLogs",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "ChangeLogs", action = "Index", id = UrlParameter.Optional }
            );
        }

        public static void RegisterHttp(HttpConfiguration config)
        {
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultAPI",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
                );
        }
    }
}
