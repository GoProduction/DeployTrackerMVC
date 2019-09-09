using System;
using System.Data.Entity;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using DeployTrackerMVC2.Models;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System.Collections.Concurrent;

namespace DeployTrackerMVC2.Hubs
{
    [HubName("deploy")]
    public class DeployHub : Hub
    {
        private dbMainEntities db = new dbMainEntities();
        private static IHubContext hubContext = GlobalHost.ConnectionManager.GetHubContext<DeployHub>();
        private static ConcurrentDictionary<string, List<int>> _mapping = new ConcurrentDictionary<string, List<int>>();
        public override System.Threading.Tasks.Task OnConnected()
        {
            _mapping.TryAdd(Context.ConnectionId, new List<int>());
            System.Diagnostics.Debug.Write(Context.ConnectionId + " has connected..");
            return base.OnConnected();
        }


        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {

            foreach (var id in _mapping[Context.ConnectionId])
            {
                var deployToPatch = db.tblDeploys.Find(id);
                deployToPatch.depLocked = false;
                db.Entry(deployToPatch).State = EntityState.Modified;
                db.SaveChanges();
                Clients.Others.unlockDeploy(id);

            }

            var list = new List<int>();
            _mapping.TryRemove(Context.ConnectionId, out list);
            Console.Write(Context.ConnectionId + " has disconnected");
            return base.OnDisconnected(stopCalled);
        }
        public void Lock(int id)
        {
            var deployToPatch = db.tblDeploys.Find(id);
            deployToPatch.depLocked = true;
            db.Entry(deployToPatch).State = EntityState.Modified;
            db.SaveChanges();
            Clients.Others.lockDeploy(id);
            _mapping[Context.ConnectionId].Add(id);
        }
        public void Unlock(int id)
        {
            var deployToPatch = db.tblDeploys.Find(id);
            deployToPatch.depLocked = false;
            db.Entry(deployToPatch).State = EntityState.Modified;
            db.SaveChanges();
            Clients.Others.unlockDeploy(id);
            _mapping[Context.ConnectionId].Remove(id);
        }

        public void FeatureChange(int id)
        {
            var deployToPatch = db.tblDeploys.Find(id);
            db.Entry(deployToPatch).State = EntityState.Modified;
            db.SaveChanges();
        }

        public void UpdateAll()
        {
            Clients.All.updateAll();

        }

        public void UpdateComments()
        {
            Clients.All.updateComments();
        }

        public void Notification(string type, string message, string icon)
        {
            if(type == "Status")
            {
                Clients.Others.browserNotification(DateTime.Now.ToString("hh:mm tt") + " || " + "A DEPLOY status has been updated...", message, icon);
            }
            else if(type == "Smoke")
            {
                Clients.Others.browserNotification(DateTime.Now.ToString("hh:mm tt") + " || " + "A SMOKE status has been updated...", message, icon);
            }
            else if (type == "Batch")
            {
                Clients.Others.browserNotification(DateTime.Now.ToString("hh:mm tt") + " || " + "A new BATCH of deploys has been submitted...", message, icon);
            }
            
        }
    }
}
