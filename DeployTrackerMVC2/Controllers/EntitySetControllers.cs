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
    public class SetEntitySetAccessRule<THub> : EntitySetController<Deploy, int>
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
    public class FeatureEntitySetController<THub> : EntitySetController<Feature, int>
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
    public class EnvironmentEntitySetController<THub> : EntitySetController<Models.DeployEnvironment, int>
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
    //Status entity set controller
    public class StatusEntitySetController<THub> : EntitySetController<Status, int>
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
    //Smoke entity set controller
    public class SmokeEntitySetController<THub> : EntitySetController<Smoke, int>
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
    public class CommentEntitySetController<THub> : EntitySetController<Comment, int>
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
    public class NotesEntityAccessRule<THub> : EntitySetController<Note, int>
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
    //Note Body entity set controller
    public class NoteBodyEntityAccessRule<THub> : EntitySetController<NoteBody, int>
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
