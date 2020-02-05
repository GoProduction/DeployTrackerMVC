using DeployTrackerMVC2.Models;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.OData;

namespace DeployTrackerMVC2.Controllers
{
    //Deploy entity set controller
    public class SetEntitySetAccessRule<THub> : EntitySetController<tblDeploy, int>
    where THub : IHub
    {
        Lazy<IHubContext> hub = new Lazy<IHubContext>(
            () => GlobalHost.ConnectionManager.GetHubContext<THub>()
        );
        
        protected IHubContext Hub
        {
            get { return hub.Value; }
        }

    }
    //Feature entity set controller
    public class FeatureEntitySetController<THub> : EntitySetController<tblFeature, int>
    where THub : IHub
    {
        Lazy<IHubContext> hub = new Lazy<IHubContext>(
            () => GlobalHost.ConnectionManager.GetHubContext<THub>()
        );

        protected IHubContext Hub
        {
            get { return hub.Value; }
        }

    }
    //Environment entity set controller
    public class EnvironmentEntitySetController<THub> : EntitySetController<tblEnvironment, int>
    where THub : IHub
    {
        Lazy<IHubContext> hub = new Lazy<IHubContext>(
            () => GlobalHost.ConnectionManager.GetHubContext<THub>()
        );

        protected IHubContext Hub
        {
            get { return hub.Value; }
        }

    }
    //Comment entity set controller
    public class CommentEntitySetController<THub> : EntitySetController<tblComment, int>
    where THub : IHub
    {
        Lazy<IHubContext> hub = new Lazy<IHubContext>(
            () => GlobalHost.ConnectionManager.GetHubContext<THub>()
        );

        protected IHubContext Hub
        {
            get { return hub.Value; }
        }

    }
    //Note entity set controller
    public class NotesEntityAccessRule<THub> : EntitySetController<tblNote, int>
    where THub : IHub
    {
        Lazy<IHubContext> hub = new Lazy<IHubContext>(
            () => GlobalHost.ConnectionManager.GetHubContext<THub>()
        );

        protected IHubContext Hub
        {
            get { return hub.Value; }
        }

    }
}
