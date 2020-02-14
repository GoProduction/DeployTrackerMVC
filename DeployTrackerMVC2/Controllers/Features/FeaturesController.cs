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
using System.Web.Http.OData;
using DeployTrackerMVC2.Hubs;
using DeployTrackerMVC2.Models;

namespace DeployTrackerMVC2.Controllers
{
    public class FeaturesController : FeatureEntitySetController<DeployHub>
    {
        private dbMainEntities db = new dbMainEntities();

        // GET: api/Features
        public override IQueryable<Feature> Get()
        {
            return db.Features;
        }


        protected override Feature GetEntityByKey(int key)
        {
            return db.Features.Find(key);
        }

        protected override Feature PatchEntity(int key, Delta<Feature> patch)
        {
            if (patch == null)
            {
                return null;
            }
            var featureToPatch = GetEntityByKey(key);
            patch.Patch(featureToPatch);
            db.Entry(featureToPatch).State = EntityState.Modified;
            db.SaveChanges();

            var changedProperty = patch.GetChangedPropertyNames().ToList()[0];
            object changedPropertyValue;
            patch.TryGetPropertyValue(changedProperty, out changedPropertyValue);

            Hub.Clients.All.updateDeploy(featureToPatch.feaID, changedProperty, changedPropertyValue);
            return featureToPatch;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool tblFeatureExists(int id)
        {
            return db.Features.Count(e => e.feaID == id) > 0;
        }
    }
}
