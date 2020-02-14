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

        public IQueryable<Comment> GettblComments()
        {
            return db.Comments;
        }

        // GET: api/CommentAPI
        [HttpGet]
        [Route("{commentByID}")]
        public IHttpActionResult GetCommentByID(int depID)
        {
            List<Comment> list = new List<Comment>();
            foreach(Comment com in db.Comments)
            {
                if(com.depID == depID)
                {
                    list.Add(com);
                    list.Sort((x, y) => DateTimeOffset.Compare(y.comDateTime, x.comDateTime));
                }
            }
            int empty = 0;
            bool isEmpty = !list.Any();
            if(isEmpty)
            {
                return Ok(empty);
            }
            
            return Ok(list);
            
        }
        
        // PUT: api/CommentAPI/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PuttblComment(int id, Comment tblComment)
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
        [ResponseType(typeof(Comment))]
        public IHttpActionResult Post(Comment tblComment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Comments.Add(tblComment);
            db.SaveChanges();
            System.Diagnostics.Debug.WriteLine("Comment posted: " + tblComment.comBody);
            return CreatedAtRoute("DefaultApi", new { id = tblComment.comID }, tblComment);
        }

        // DELETE: api/CommentAPI/5
        [ResponseType(typeof(Comment))]
        public IHttpActionResult DeletetblComment(int id)
        {
            Comment tblComment = db.Comments.Find(id);
            if (tblComment == null)
            {
                return NotFound();
            }

            db.Comments.Remove(tblComment);
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
            return db.Comments.Count(e => e.comID == id) > 0;
        }
    }
}
