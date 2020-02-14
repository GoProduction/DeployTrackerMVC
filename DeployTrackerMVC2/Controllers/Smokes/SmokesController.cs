using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using System.Web.Http.OData;
using System.Web.Http.OData.Routing;
using DeployTrackerMVC2.Models;

namespace DeployTrackerMVC2.Controllers
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using System.Web.Http.OData.Extensions;
    using DeployTrackerMVC2.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<Smoke>("Smokes");
    builder.EntitySet<Deploy>("Deploys"); 
    config.Routes.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class SmokesController : ODataController
    {
        private dbMainEntities db = new dbMainEntities();

        // GET: odata/Smokes
        [EnableQuery]
        public IQueryable<Smoke> GetSmokes()
        {
            return db.Smokes;
        }

        // GET: odata/Smokes(5)
        [EnableQuery]
        public SingleResult<Smoke> GetSmoke([FromODataUri] int key)
        {
            return SingleResult.Create(db.Smokes.Where(smoke => smoke.smokeID == key));
        }

        // PUT: odata/Smokes(5)
        public IHttpActionResult Put([FromODataUri] int key, Delta<Smoke> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Smoke smoke = db.Smokes.Find(key);
            if (smoke == null)
            {
                return NotFound();
            }

            patch.Put(smoke);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SmokeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(smoke);
        }

        // POST: odata/Smokes
        public IHttpActionResult Post(Smoke smoke)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Smokes.Add(smoke);
            db.SaveChanges();

            return Created(smoke);
        }

        // PATCH: odata/Smokes(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public IHttpActionResult Patch([FromODataUri] int key, Delta<Smoke> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Smoke smoke = db.Smokes.Find(key);
            if (smoke == null)
            {
                return NotFound();
            }

            patch.Patch(smoke);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SmokeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(smoke);
        }

        // DELETE: odata/Smokes(5)
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            Smoke smoke = db.Smokes.Find(key);
            if (smoke == null)
            {
                return NotFound();
            }

            db.Smokes.Remove(smoke);
            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/Smokes(5)/Deploy
        [EnableQuery]
        public IQueryable<Deploy> GetDeploy([FromODataUri] int key)
        {
            return db.Smokes.Where(m => m.smokeID == key).SelectMany(m => m.Deploy);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool SmokeExists(int key)
        {
            return db.Smokes.Count(e => e.smokeID == key) > 0;
        }
    }
}
