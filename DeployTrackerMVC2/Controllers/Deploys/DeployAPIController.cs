using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.OData;
using DeployTrackerMVC2.App_Start;
using DeployTrackerMVC2.Hubs;
using DeployTrackerMVC2.Models;
using JsonPatch;
using JsonPatch.Formatting;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DeployTrackerMVC2.Controllers
{
    [RoutePrefix("api/DeployAPI")]
    public class DeployAPIController : ApiController
    {

        public static void ConfigureApis(HttpConfiguration config) {
            config.Formatters.Add(new JsonPatchFormatter());
        }

        private dbMainEntities db = new dbMainEntities();

        // GET: api/DeployAPI
        public IQueryable<Deploy> GettblDeploys()
        {
            return db.Deploys;
        }
        
        
        // GET: api/DeployAPI/deployByID
        
        [HttpGet]
        [Route("{deployByID}")]
        public IHttpActionResult GetSingleDeploy(int depID)
        {
            
            Deploy deploy = db.Deploys.Find(depID);
            if (deploy == null)
            {
                return NotFound();
            }

            return Ok(deploy);
            
        }

        [HttpPatch]
        [Route]
        public HttpResponseMessage PatchDeploy(int id, Delta<Deploy> newDeploy)
        {
            using (dbMainEntities objContext = new dbMainEntities())
            {
                Deploy deploy = objContext.Deploys.SingleOrDefault(p => p.depID == id);
                if (deploy == null)
                {
                    throw new HttpResponseException(HttpStatusCode.NotFound);
                }
                newDeploy.Patch(deploy);
                objContext.SaveChanges();
            }
            return Request.CreateResponse(HttpStatusCode.NoContent);
        }

        // PUT: api/DeployAPI/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PuttblDeploy(int id, Deploy tblDeploy)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != tblDeploy.depID)
            {
                return BadRequest();
            }

            db.Entry(tblDeploy).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tblDeployExists(id))
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

        //New POST 3
        [ResponseType(typeof(Deploy))]
        public IHttpActionResult Post(Deploy deploy)
        {

            
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            db.Deploys.Add(deploy);
            
            
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = deploy.depID }, deploy);
        }

        // DELETE: api/DeployAPI/5
        [ResponseType(typeof(Deploy))]
        public IHttpActionResult DeletetblDeploy(int id)
        {
            Deploy tblDeploy = db.Deploys.Find(id);
            if (tblDeploy == null)
            {
                return NotFound();
            }

            db.Deploys.Remove(tblDeploy);
            db.SaveChanges();

            return Ok(tblDeploy);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool tblDeployExists(int id)
        {
            return db.Deploys.Count(e => e.depID == id) > 0;
        }
    }
}
