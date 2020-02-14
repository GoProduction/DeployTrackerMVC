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
using DeployTrackerMVC2.Hubs;
using DeployTrackerMVC2.Models;
using Microsoft.AspNet.SignalR;

namespace DeployTrackerMVC2.Controllers
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
    public class NotesController : NotesEntityAccessRule<DeployHub>
    {
        private dbMainEntities db = new dbMainEntities();


        public override IQueryable<Note> Get()
        {
            return db.Notes;
        }

        protected override Note GetEntityByKey(int key)
        {
            return db.Notes.Find(key);
        }

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

        public IHttpActionResult Create(Note note)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            db.Notes.Add(note);
            db.SaveChanges();
            return Created(note);
        }

        [AcceptVerbs("DELETE")]

        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            Note note = db.Notes.Find(key);
            System.Diagnostics.Debug.WriteLine(key);
            if (note == null)
            {
                return NotFound();
            }

            db.Notes.Remove(note);
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

        private bool tblNotesExists(int id)
        {
            return db.Notes.Count(e => e.noteID == id) > 0;
        }
    }
}
