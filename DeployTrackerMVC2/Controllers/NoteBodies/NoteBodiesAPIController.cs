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
using System.Web.Http.Description;
using DeployTrackerMVC2.Models;

namespace DeployTrackerMVC2.Controllers.NoteBodies
{
    public class NoteBodiesAPIController : ApiController
    {
        private dbMainEntities db = new dbMainEntities();

        // GET: api/NoteBodiesAPI
        public IQueryable<NoteBody> GetNoteBodies()
        {
            System.Diagnostics.Debug.WriteLine("Get all note bodies");
            return db.NoteBodies;
        }

        // GET: api/NoteBodiesAPI/5
        [HttpGet]
        [Route("{noteBodyByNoteID}")]
        public async Task<IHttpActionResult> GetNoteBody(string data)
        {
            NoteBody noteBody = await db.NoteBodies.FindAsync(data);
            System.Diagnostics.Debug.WriteLine("Found: " + noteBody);
            if (noteBody == null)
            {
                return NotFound();
            }

            return Ok(noteBody);
        }
        
        // PUT: api/NoteBodiesAPI/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutNoteBody(int id, NoteBody noteBody)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != noteBody.id)
            {
                return BadRequest();
            }

            db.Entry(noteBody).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NoteBodyExists(id))
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

        // POST: api/NoteBodiesAPI
        [ResponseType(typeof(NoteBody))]
        public async Task<IHttpActionResult> PostNoteBody(NoteBody noteBody)
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

            return CreatedAtRoute("DefaultApi", new { id = noteBody.id }, noteBody);
        }

        // DELETE: api/NoteBodiesAPI/5
        [ResponseType(typeof(NoteBody))]
        public async Task<IHttpActionResult> DeleteNoteBody(int id)
        {
            NoteBody noteBody = await db.NoteBodies.FindAsync(id);
            if (noteBody == null)
            {
                return NotFound();
            }

            db.NoteBodies.Remove(noteBody);
            await db.SaveChangesAsync();

            return Ok(noteBody);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool NoteBodyExists(int id)
        {
            return db.NoteBodies.Count(e => e.id == id) > 0;
        }
    }
}