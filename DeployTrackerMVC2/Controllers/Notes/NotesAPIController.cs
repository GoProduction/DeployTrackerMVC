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
using DeployTrackerMVC2.Models;

namespace DeployTrackerMVC2.Controllers.Notes
{
    public class NotesAPIController : ApiController
    {
        private dbMainEntities db = new dbMainEntities();

        // GET: api/NotesAPI
        public IQueryable<tblNote> GettblNotes()
        {
            return db.tblNotes;
        }

        // GET: api/NotesAPI/5
        [ResponseType(typeof(tblNote))]
        public IHttpActionResult GettblNote(int id)
        {
            tblNote tblNote = db.tblNotes.Find(id);
            if (tblNote == null)
            {
                return NotFound();
            }

            return Ok(tblNote);
        }

        // PUT: api/NotesAPI/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PuttblNote(int id, tblNote tblNote)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != tblNote.noteID)
            {
                return BadRequest();
            }

            db.Entry(tblNote).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tblNoteExists(id))
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

        // POST: api/NotesAPI
        [ResponseType(typeof(tblNote))]
        public IHttpActionResult PosttblNote(tblNote tblNote)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            db.tblNotes.Add(tblNote);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = tblNote.noteID }, tblNote);
        }

        // DELETE: api/NotesAPI/5
        [ResponseType(typeof(tblNote))]
        public IHttpActionResult DeletetblNote(int id)
        {
            tblNote tblNote = db.tblNotes.Find(id);
            if (tblNote == null)
            {
                return NotFound();
            }

            db.tblNotes.Remove(tblNote);
            db.SaveChanges();

            return Ok(tblNote);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool tblNoteExists(int id)
        {
            return db.tblNotes.Count(e => e.noteID == id) > 0;
        }
    }
}