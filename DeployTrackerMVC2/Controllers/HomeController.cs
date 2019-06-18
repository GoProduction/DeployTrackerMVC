using DayPilot.Web.Ui;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DeployTrackerMVC2.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            return View();
        }

        public ActionResult NewDeploy()
        {
            ViewBag.Title = "New Deploy";
            return View();
        }

    }

}
