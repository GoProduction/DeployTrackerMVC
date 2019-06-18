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


        public override IQueryable<tblEnvironment> Get()
        {
            return db.tblEnvironments;
        }

        protected override tblEnvironment GetEntityByKey(int key)
        {
            return db.tblEnvironments.Find(key);
        }

        // PUT: api/Environments/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PuttblEnvironment(int id, tblEnvironment tblEnvironment)
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
        [ResponseType(typeof(tblEnvironment))]
        public IHttpActionResult PosttblEnvironment(tblEnvironment tblEnvironment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.tblEnvironments.Add(tblEnvironment);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = tblEnvironment.envID }, tblEnvironment);
        }

        // DELETE: api/Environments/5
        [ResponseType(typeof(tblEnvironment))]
        public IHttpActionResult DeletetblEnvironment(int id)
        {
            tblEnvironment tblEnvironment = db.tblEnvironments.Find(id);
            if (tblEnvironment == null)
            {
                return NotFound();
            }

            db.tblEnvironments.Remove(tblEnvironment);
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
            return db.tblEnvironments.Count(e => e.envID == id) > 0;
        }
    }
}
