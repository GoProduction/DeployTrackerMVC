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
using System.Web.Http.OData;
using DeployTrackerMVC2.Hubs;
using DeployTrackerMVC2.Models;

namespace DeployTrackerMVC2.Controllers.Comments
{
    public class CommentsController : CommentEntitySetController<DeployHub>
    {
        private dbMainEntities db = new dbMainEntities();

        public override IQueryable<tblComment> Get()
        {
            return db.tblComments;
        }

        protected override tblComment GetEntityByKey(int key)
        {
            return db.tblComments.Find(key);
        }

        protected override tblComment PatchEntity(int key, Delta<tblComment> patch)
        {
            if (patch == null)
            {
                return null;
            }
            var commentToPatch = GetEntityByKey(key);
            patch.Patch(commentToPatch);
            db.Entry(commentToPatch).State = EntityState.Modified;
            db.SaveChanges();

            var changedProperty = patch.GetChangedPropertyNames().ToList()[0];
            object changedPropertyValue;
            patch.TryGetPropertyValue(changedProperty, out changedPropertyValue);

            Hub.Clients.All.updateDeploy(commentToPatch.comID, changedProperty, changedPropertyValue);
            return commentToPatch;
        }

        /*
        //POST1: odata/Comments
        public async Task<IHttpActionResult> PostComment(tblComment comment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            db.tblComments.Add(comment);
            await db.SaveChangesAsync();
            return Created(comment);
        }
        */

        // POST2: odata/tblComments
        [System.Web.Mvc.HttpPost]
        public IHttpActionResult Create(tblComment tblComment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.tblComments.Add(tblComment);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (tblCommentExists(tblComment.comID))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(tblComment);
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
