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
                    //Reset the smoke value to "Not Ready" if it's being deployed, and the value is already in the "Ready" state
                    if (status.Equals(2) && deployToPatch.smokeID != 1)
                    {
                        //System.Diagnostics.Debug.WriteLine("Reset the smoke value to 'Not Ready'");
                        //deployToPatch.smokeID = 1;
                        //list.Add("smokeID" + 1);
                    }
                }
            }

            //If the status has been changed to DEPLOYING and the end time field is NOT empty,
            //change the deploy objects end time to null, and add the depEndTime property and null
            //value to the list
            if(status.Equals(2) && deployToPatch.depEndTime != null)
            {
                deployToPatch.depEndTime = null;
                list.Add("depEndTime" + null);
                System.Diagnostics.Debug.WriteLine("Reset the end time.");
            }
            //Else, if the status has been changed to QUEUED and the start time field is NOT empty,
            //change  the deploy objects start time AND end time to null, and add depStartTime and depEndTime
            //property and null value to the list
            else if(status.Equals(1) && deployToPatch.depStartTime != null)
            {
                deployToPatch.depStartTime = null;
                deployToPatch.depEndTime = null;
                list.Add("depStartTime" + null);
                list.Add("depEndTime" + null);
                System.Diagnostics.Debug.WriteLine("Reset the start and end time.");
            }
            //Patch the deploy on the server-end
            patch.Patch(deployToPatch);
            db.Entry(deployToPatch).State = EntityState.Modified;
            db.SaveChanges();
            
            //Prepare changed properties to send to all clients
            foreach (var changedProperty in list) {
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
