using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DeployTrackerMVC2.Controllers
{
    //Make sure all page controllers are added to the RouteConfig file as well. No route, no clout.
    public class DeveloperController : Controller
    {
        // GET: Developer
        public ActionResult Index()
        {
            return View();
        }
    }
    public class QAController : Controller
    {
        // GET: Developer
        public ActionResult Index()
        {
            return View();
        }
    }
    public class NewDeployController : Controller
    {
        // GET: NewDeploy
        public ActionResult Index()
        {
            return View();
        }
    }
    public class ChangeLogsController : Controller 
    {
        //GET: ChangeLogs
        public ActionResult Index()
        {
            return View();
        }
    }
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            return View();
        }

    }
}