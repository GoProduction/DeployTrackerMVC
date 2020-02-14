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
        public IQueryable<Note> GettblNotes()
        {
            return db.Notes;
        }

        // GET: api/NotesAPI/5
        [ResponseType(typeof(Note))]
        public IHttpActionResult GettblNote(int id)
        {
            Note tblNote = db.Notes.Find(id);
            if (tblNote == null)
            {
                return NotFound();
            }

            return Ok(tblNote);
        }

        // PUT: api/NotesAPI/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PuttblNote(int id, Note tblNote)
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
        [ResponseType(typeof(Note))]
        public IHttpActionResult PosttblNote(Note tblNote)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            db.Notes.Add(tblNote);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = tblNote.noteID }, tblNote);
        }

        // DELETE: api/NotesAPI/5
        [ResponseType(typeof(Note))]
        public IHttpActionResult DeletetblNote(int id)
        {
            Note tblNote = db.Notes.Find(id);
            if (tblNote == null)
            {
                return NotFound();
            }

            db.Notes.Remove(tblNote);
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
            return db.Notes.Count(e => e.noteID == id) > 0;
        }
    }
}