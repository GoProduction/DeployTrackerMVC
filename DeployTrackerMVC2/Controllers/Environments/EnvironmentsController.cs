using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using DeployTrackerMVC2.Hubs;
using DeployTrackerMVC2.Models;

namespace DeployTrackerMVC2.Controllers
{
    public class EnvironmentsController : EnvironmentEntitySetController<DeployHub>
    {
        private dbMainEntities db = new dbMainEntities();


        public override IQueryable<DeployEnvironment> Get()
        {
            return db.DeployEnvironments;
        }

        protected override DeployEnvironment GetEntityByKey(int key)
        {
            return db.DeployEnvironments.Find(key);
        }

        // PUT: api/Environments/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PuttblEnvironment(int id, DeployEnvironment tblEnvironment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != tblEnvironment.envID)
            {
                return BadRequest();
            }

            db.Entry(tblEnvironment).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tblEnvironmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Environments
        [ResponseType(typeof(DeployEnvironment))]
        public IHttpActionResult PosttblEnvironment(DeployEnvironment tblEnvironment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.DeployEnvironments.Add(tblEnvironment);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = tblEnvironment.envID }, tblEnvironment);
        }

        // DELETE: api/Environments/5
        [ResponseType(typeof(DeployEnvironment))]
        public IHttpActionResult DeletetblEnvironment(int id)
        {
            DeployEnvironment tblEnvironment = db.DeployEnvironments.Find(id);
            if (tblEnvironment == null)
            {
                return NotFound();
            }

            db.DeployEnvironments.Remove(tblEnvironment);
            db.SaveChanges();

            return Ok(tblEnvironment);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool tblEnvironmentExists(int id)
        {
            return db.DeployEnvironments.Count(e => e.envID == id) > 0;
        }
    }
}
