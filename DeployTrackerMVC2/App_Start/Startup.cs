using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(DeployTrackerMVC2.App_Start.Startup))]

namespace DeployTrackerMVC2.App_Start
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }


    }
}
