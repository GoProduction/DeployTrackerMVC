using DeployTrackerMVC2.Hubs;
using DeployTrackerMVC2.Models;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.OData;

namespace DeployTrackerMVC2.Controllers
{
    public class DeploysController : SetEntitySetAccessRule<DeployHub>
    {
        private dbMainEntities db = new dbMainEntities();


        public override IQueryable<Deploy> Get()
        {
            return db.Deploys;
        }

        
        protected override Deploy GetEntityByKey(int key)
        {
            return db.Deploys.Find(key);
        }

        [AcceptVerbs("PATCH", "MERGE")]
        protected override Deploy PatchEntity(int key, Delta<Deploy> patch)
        {
            //Check if data is null
            if (patch == null)
            {
                return null;
            }

            //Initialize deploy object, patch delta into list, and status object
            var deployToPatch = GetEntityByKey(key);
            var list = patch.GetChangedPropertyNames().ToList();
            object status = null;

            //Determine if status is being changed
            foreach (var prop in list)
            {
                //If the data includes the field 'statusID'
                if(prop == "statusID")
                {
                    //Instantiate the status object
                    patch.TryGetPropertyValue(prop, out status);
                    System.Diagnostics.Debug.WriteLine("Status was set to: " + status);
                }
            }

            //If the status has been changed to DEPLOYING and the end time field is NOT empty,
            //change the deploy objects end time to null, and add the depEndTime property and null
            //value to the list
            if(status != null)
            {
                //If status is set to QUEUED
                if (status.Equals(1))
                {
                    //If start time or end time are NOT null, change them both to null
                    if(deployToPatch.depStartTime != null || deployToPatch.depEndTime != null)
                    {
                        deployToPatch.depStartTime = null;
                        deployToPatch.depEndTime = null;
                        list.Add("depStartTime" + null);
                        list.Add("depEndTime" + null);
                        System.Diagnostics.Debug.WriteLine("Reset the start and end time.");
                    }
                    //If smoke value does NOT equal "NOT READY", change it to NOT READY
                    if(deployToPatch.smokeID != 1)
                    {
                        deployToPatch.smokeID = 1;
                        list.Add("smokeID");
                        patch.TrySetPropertyValue("smokeID", 1);
                    }
                }
                //Else if the status is set to DEPLOYING
                else if (status.Equals(2))
                {
                    //If the end time is NOT null, change it to null
                    if(deployToPatch.depEndTime != null)
                    {
                        deployToPatch.depEndTime = null;
                        list.Add("depEndTime");
                        System.Diagnostics.Debug.WriteLine("Reset the end time.");
                    }
                    //If the smoke value does NOT equal "NOT READY", change it to NOT READY
                    if(deployToPatch.smokeID != 1)
                    {
                        deployToPatch.smokeID = 1;
                        list.Add("smokeID");
                        patch.TrySetPropertyValue("smokeID", 1);
                    }
                }
            }
            //Patch the deploy on the server-end
            patch.Patch(deployToPatch);
            db.Entry(deployToPatch).State = EntityState.Modified;
            db.SaveChanges();
            
            //Prepare changed properties to send to all clients
            foreach (var changedProperty in list)
            {
                object changedPropertyValue;
                patch.TryGetPropertyValue(changedProperty, out changedPropertyValue);
                Hub.Clients.All.updateDeploy(deployToPatch.depID, changedProperty, changedPropertyValue);
                System.Diagnostics.Debug.WriteLine("Deploy has been patched: " + deployToPatch.depID + ", " + changedProperty + ", " + changedPropertyValue);
            }
           
            return deployToPatch;
        }
        
        public IHttpActionResult Create(Deploy deploy)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            db.Deploys.Add(deploy);
            db.SaveChanges();
            return Created(deploy);
        }
        [AcceptVerbs("DELETE")]
        
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            Deploy deploy = db.Deploys.Find(key);
            System.Diagnostics.Debug.WriteLine(key);
            if (deploy == null)
            {
                return NotFound();
            }

            db.Deploys.Remove(deploy);
            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool tblDeployExists(int id)
        {
            return db.Deploys.Count(e => e.depID == id) > 0;
        }
    }
}
