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

using DeployTrackerMVC2.App_Start;
using DeployTrackerMVC2.Hubs;
using DeployTrackerMVC2.Models;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DeployTrackerMVC2.Controllers
{
    public class DeployAPIController : ApiController
    {


        private dbMainEntities db = new dbMainEntities();

        // GET: api/DeployAPI
        public IQueryable<tblDeploy> GettblDeploys()
        {
            return db.tblDeploys;
        }
        
        
        // GET: api/DeployAPI/deployByID
        
        [HttpGet]
        [Route("{deployByID}")]
        public IHttpActionResult GetSingleDeploy(int depID)
        {
            
            tblDeploy deploy = db.tblDeploys.Find(depID);
            if (deploy == null)
            {
                return NotFound();
            }

            return Ok(deploy);
            
        }

        [HttpPatch]
        [Route("{PatchDeploy}")]
        public IHttpActionResult PatchDeploy ([FromBody] tblDeploy request)
        {
            var deploy = db.tblDeploys.FirstOrDefault(c => c.depID == request.depID);
            if (deploy == null) return NotFound();
            else
            {
                deploy.depEnvironment = request.depEnvironment;
            }
            return Ok();
        }
        
        // PUT: api/DeployAPI/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PuttblDeploy(int id, tblDeploy tblDeploy)
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
        [ResponseType(typeof(tblDeploy))]
        public IHttpActionResult Post(tblDeploy deploy)
        {


            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.tblDeploys.Add(deploy);
            deploy.depLocked = false;

            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = deploy.depID }, deploy);
        }

        //New POST 2
        /*
        public IHttpActionResult Post(JObject objData)
        {
            List<tblDeploy> listDeploys = new List<tblDeploy>();
            //1.
            dynamic jsonData = objData;
            
            //3.
            JArray deploysJSON = new JArray(jsonData.deploy);
            
            //5.
            foreach (var item in deploysJSON)
            {
                listDeploys.Add(item.ToObject<tblDeploy>());
                
            }
            
            //7.
            foreach (tblDeploy deploy in listDeploys)
            {
                db.tblDeploys.Add(deploy);
            }

            db.SaveChanges();

            return Ok();
        }
        */

        //New POST 1
        /*
        [ResponseType(typeof(tblDeploy))]
        public async Task<IHttpActionResult> PosttblDeploy(tblDeploy deploy)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var entity = AutoMap.Map<tblDeploy>(deploy);

            db.tblDeploys.Add(entity);
            oneDeploy.depLocked = false;
            db.SaveChanges();

               
            return CreatedAtRoute("DefaultApi", new { id = tblDeploy.depID }, deploys);

        }
        */

        /*
        //ORIGINAL POST: api/DeployAPI
        [ResponseType(typeof(tblDeploy))]
        public IHttpActionResult PosttblDeploy(tblDeploy tblDeploy)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            db.tblDeploys.Add(tblDeploy);
            tblDeploy.depLocked = false;
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = tblDeploy.depID}, tblDeploy);
        }
        */

        // DELETE: api/DeployAPI/5
        [ResponseType(typeof(tblDeploy))]
        public IHttpActionResult DeletetblDeploy(int id)
        {
            tblDeploy tblDeploy = db.tblDeploys.Find(id);
            if (tblDeploy == null)
            {
                return NotFound();
            }

            db.tblDeploys.Remove(tblDeploy);
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
            return db.tblDeploys.Count(e => e.depID == id) > 0;
        }
    }
}
