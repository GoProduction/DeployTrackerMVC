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
            System.Diagnostics.Debug.WriteLine(Context.ConnectionId + " has connected..");
            return base.OnConnected();
        }


        public void FeatureChange(int id)
        {
            var deployToPatch = db.Deploys.Find(id);
            db.Entry(deployToPatch).State = EntityState.Modified;
            db.SaveChanges();
            System.Diagnostics.Debug.WriteLine("FeatureChange(id = " + id + ")");
        }

        public void UpdateAll(String response)
        {
            Clients.All.updateAll(response);

        }

        public void UpdateComments(String response)
        {
            Clients.All.updateComments(response);
        }

        public void RemoveDeploy(int id) 
        {
            Clients.All.removeDeploy(id);
        }

        public void updateNotes(String response)
        {
            Clients.All.updateNewNote(response);
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
