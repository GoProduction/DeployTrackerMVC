using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using System.Web.Http.OData;
using System.Web.Http.OData.Routing;
using DeployTrackerMVC2.Models;

namespace DeployTrackerMVC2.Controllers.NoteBodies
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using System.Web.Http.OData.Extensions;
    using DeployTrackerMVC2.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<NoteBody>("NoteBodies");
    builder.EntitySet<Note>("Notes"); 
    config.Routes.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class NoteBodiesController : ODataController
    {
        private dbMainEntities db = new dbMainEntities();

        // GET: odata/NoteBodies
        [EnableQuery]
        public IQueryable<NoteBody> GetNoteBodies()
        {
            return db.NoteBodies;
        }

        // GET: odata/NoteBodies(5)
        [EnableQuery]
        public SingleResult<NoteBody> GetNoteBody([FromODataUri] int key)
        {
            return SingleResult.Create(db.NoteBodies.Where(noteBody => noteBody.id == key));
        }

        // PUT: odata/NoteBodies(5)
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<NoteBody> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            NoteBody noteBody = await db.NoteBodies.FindAsync(key);
            if (noteBody == null)
            {
                return NotFound();
            }

            patch.Put(noteBody);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NoteBodyExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(noteBody);
        }

        // POST: odata/NoteBodies
        public async Task<IHttpActionResult> Post(NoteBody noteBody)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.NoteBodies.Add(noteBody);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (NoteBodyExists(noteBody.id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(noteBody);
        }

        // PATCH: odata/NoteBodies(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<NoteBody> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            NoteBody noteBody = await db.NoteBodies.FindAsync(key);
            if (noteBody == null)
            {
                return NotFound();
            }

            patch.Patch(noteBody);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NoteBodyExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(noteBody);
        }

        // DELETE: odata/NoteBodies(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            NoteBody noteBody = await db.NoteBodies.FindAsync(key);
            if (noteBody == null)
            {
                return NotFound();
            }

            db.NoteBodies.Remove(noteBody);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/NoteBodies(5)/Note
        [EnableQuery]
        public SingleResult<Note> GetNote([FromODataUri] int key)
        {
            return SingleResult.Create(db.NoteBodies.Where(m => m.id == key).Select(m => m.Note));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool NoteBodyExists(int key)
        {
            return db.NoteBodies.Count(e => e.id == key) > 0;
        }
    }
}
