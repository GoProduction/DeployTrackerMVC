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
using DeployTrackerMVC2.Hubs;
using DeployTrackerMVC2.Models;

namespace DeployTrackerMVC2.Controllers.Notes
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using System.Web.Http.OData.Extensions;
    using DeployTrackerMVC2.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<Note>("Notes");
    builder.EntitySet<Deploy>("Deploys"); 
    builder.EntitySet<NoteBody>("NoteBodies"); 
    config.Routes.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class NotesController : NotesEntityAccessRule<DeployHub>
    {
        private dbMainEntities db = new dbMainEntities();

        // GET: odata/Notes
        [EnableQuery]
        public IQueryable<Note> GetNotes()
        {
            return db.Notes;
        }

        // GET: odata/Notes(5)
        [EnableQuery]
        public SingleResult<Note> GetNote([FromODataUri] int key)
        {
            return SingleResult.Create(db.Notes.Where(note => note.noteID == key));
        }

        // PUT: odata/Notes(5)
        public IHttpActionResult Put([FromODataUri] int key, Delta<Note> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Note note = db.Notes.Find(key);
            if (note == null)
            {
                return NotFound();
            }

            patch.Put(note);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NoteExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(note);
        }

        // POST: odata/Notes
        public IHttpActionResult Post(Note note)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Notes.Add(note);
            db.SaveChanges();

            return Created(note);
        }

        // PATCH: odata/Notes(5)
        [AcceptVerbs("PATCH", "MERGE")]
        protected override Note PatchEntity(int key, Delta<Note> patch)
        {
            if (patch == null)
            {
                return null;
            }
            System.Diagnostics.Debug.WriteLine("The key is: " + key);
            var noteToPatch = GetEntityByKey(key);
            patch.Patch(noteToPatch);
            db.Entry(noteToPatch).State = EntityState.Modified;
            db.SaveChanges();

            //Prepare changed properties to send to all clients
            var list = patch.GetChangedPropertyNames().ToList();
            foreach (var changedProperty in list)
            {
                object changedPropertyValue;
                patch.TryGetPropertyValue(changedProperty, out changedPropertyValue);
                Hub.Clients.All.updatePatchedNote(noteToPatch.noteID, changedProperty, changedPropertyValue);
                System.Diagnostics.Debug.WriteLine("Note has been patched: " + noteToPatch.noteID + ", " + changedProperty + ", " + changedPropertyValue);

            }

            return noteToPatch;
        }

        // DELETE: odata/Notes(5)
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            Note note = db.Notes.Find(key);
            if (note == null)
            {
                return NotFound();
            }

            db.Notes.Remove(note);
            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/Notes(5)/Deploy
        [EnableQuery]
        public IQueryable<Deploy> GetDeploy([FromODataUri] int key)
        {
            return db.Notes.Where(m => m.noteID == key).SelectMany(m => m.Deploy);
        }

        // GET: odata/Notes(5)/NoteBody
        [EnableQuery]
        public IQueryable<NoteBody> GetNoteBody([FromODataUri] int key)
        {
            return db.Notes.Where(m => m.noteID == key).SelectMany(m => m.NoteBody);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool NoteExists(int key)
        {
            return db.Notes.Count(e => e.noteID == key) > 0;
        }
    }
}
