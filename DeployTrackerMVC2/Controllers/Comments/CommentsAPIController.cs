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

namespace DeployTrackerMVC2.Controllers.Comments
{
    public class CommentAPIController : ApiController
    {
        private dbMainEntities db = new dbMainEntities();

        // GET: api/CommentAPI
        public IQueryable<tblComment> GettblComments()
        {
            return db.tblComments;
        }

        // GET: api/CommentAPI/commentByDepID
        [HttpGet]
        [Route("{commentByDepID}")]
        public IHttpActionResult GettblComment(int depID)
        {
            tblComment comment = db.tblComments.Find(depID);
            if (comment == null)
            {
                return NotFound();
            }

            return Ok(comment);
        }

        // PUT: api/CommentAPI/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PuttblComment(int id, tblComment tblComment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != tblComment.comID)
            {
                return BadRequest();
            }

            db.Entry(tblComment).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tblCommentExists(id))
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

        // POST: api/CommentAPI
        [ResponseType(typeof(tblComment))]
        public IHttpActionResult Post(tblComment tblComment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.tblComments.Add(tblComment);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = tblComment.comID }, tblComment);
        }

        // DELETE: api/CommentAPI/5
        [ResponseType(typeof(tblComment))]
        public IHttpActionResult DeletetblComment(int id)
        {
            tblComment tblComment = db.tblComments.Find(id);
            if (tblComment == null)
            {
                return NotFound();
            }

            db.tblComments.Remove(tblComment);
            db.SaveChanges();

            return Ok(tblComment);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool tblCommentExists(int id)
        {
            return db.tblComments.Count(e => e.comID == id) > 0;
        }
    }
}
