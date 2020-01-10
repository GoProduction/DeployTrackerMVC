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

namespace DeployTrackerMVC2.Controllers.Notes
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using System.Web.Http.OData.Extensions;
    using DeployTrackerMVC2.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<tblNote>("Notes");
    builder.EntitySet<tblDeploy>("tblDeploys"); 
    config.Routes.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class NotesController : ODataController
    {
        private dbMainEntities db = new dbMainEntities();

        // GET: odata/Notes
        [EnableQuery]
        public IQueryable<tblNote> GetNotes()
        {
            return db.tblNotes;
        }

        // GET: odata/Notes(5)
        [EnableQuery]
        public SingleResult<tblNote> GettblNote([FromODataUri] int key)
        {
            return SingleResult.Create(db.tblNotes.Where(tblNote => tblNote.noteID == key));
        }

        // PUT: odata/Notes(5)
        public IHttpActionResult Put([FromODataUri] int key, Delta<tblNote> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            tblNote tblNote = db.tblNotes.Find(key);
            if (tblNote == null)
            {
                return NotFound();
            }

            patch.Put(tblNote);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tblNoteExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(tblNote);
        }

        // POST: odata/Notes
        public IHttpActionResult Post(tblNote tblNote)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.tblNotes.Add(tblNote);
            db.SaveChanges();

            return Created(tblNote);
        }

        // PATCH: odata/Notes(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public IHttpActionResult Patch([FromODataUri] int key, Delta<tblNote> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            tblNote tblNote = db.tblNotes.Find(key);
            if (tblNote == null)
            {
                return NotFound();
            }

            patch.Patch(tblNote);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tblNoteExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(tblNote);
        }

        // DELETE: odata/Notes(5)
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            tblNote tblNote = db.tblNotes.Find(key);
            if (tblNote == null)
            {
                return NotFound();
            }

            db.tblNotes.Remove(tblNote);
            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/Notes(5)/tblDeploys
        [EnableQuery]
        public IQueryable<tblDeploy> GettblDeploys([FromODataUri] int key)
        {
            return db.tblNotes.Where(m => m.noteID == key).SelectMany(m => m.tblDeploys);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool tblNoteExists(int key)
        {
            return db.tblNotes.Count(e => e.noteID == key) > 0;
        }
    }
}
