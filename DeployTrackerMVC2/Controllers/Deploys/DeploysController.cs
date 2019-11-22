using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.OData;
using DeployTrackerMVC2.Hubs;
using DeployTrackerMVC2.Models;

namespace DeployTrackerMVC2.Controllers
{
    public class DeploysController : EntitySetControllerWithHub<DeployHub>
    {
        private dbMainEntities db = new dbMainEntities();


        public override IQueryable<tblDeploy> Get()
        {
            return db.tblDeploys;
        }

        protected override tblDeploy GetEntityByKey(int key)
        {
            return db.tblDeploys.Find(key);
        }

        [AcceptVerbs("PATCH", "MERGE")]
        protected override tblDeploy PatchEntity(int key, Delta<tblDeploy> patch)
        {
            if (patch == null)
            {
                return null;
            }
            System.Diagnostics.Debug.WriteLine("The key is: " + key);
            var deployToPatch = GetEntityByKey(key);
            patch.Patch(deployToPatch);
            db.Entry(deployToPatch).State = EntityState.Modified;
            db.SaveChanges();

            var changedProperty = patch.GetChangedPropertyNames().ToList()[0];
            object changedPropertyValue;
            patch.TryGetPropertyValue(changedProperty, out changedPropertyValue);

            Hub.Clients.All.updateDeploy(deployToPatch.depID, changedProperty, changedPropertyValue);
            System.Diagnostics.Debug.WriteLine("Deploy has been patched: " + deployToPatch.depID + ", " + changedProperty + ", " + changedPropertyValue);
            return deployToPatch;
        }
        
        
        public IHttpActionResult Create(tblDeploy deploy)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            db.tblDeploys.Add(deploy);
            db.SaveChanges();
            return Created(deploy);
        }

        public IHttpActionResult Delete([FromODataUri] int key)
        {
            tblDeploy deploy = db.tblDeploys.Find(key);
            if (deploy == null)
            {
                return NotFound();
            }

            db.tblDeploys.Remove(deploy);
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
            return db.tblDeploys.Count(e => e.depID == id) > 0;
        }
    }
}
