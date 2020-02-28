using DeployTrackerMVC2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.OData.Builder;
using System.Web.Http.OData.Extensions;

namespace DeployTrackerMVC2
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            //HELP IGNORE LOOP REFERENCES
            config.Formatters.JsonFormatter.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;

            // Web API configuration and services

            // Web API routes
            //config.MapHttpAttributeRoutes();
            var batchHandler = new BatchHandler(config);

            config.Routes.MapHttpRoute("batch", "api/batch",
                           null, null, batchHandler);

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            ODataConventionModelBuilder modelBuilder = new ODataConventionModelBuilder();
            modelBuilder.EntitySet<Deploy>("Deploys");
            modelBuilder.EntitySet<Feature>("Features");
            modelBuilder.EntitySet<DeployEnvironment>("Environments");
            modelBuilder.EntitySet<Status>("Status");
            modelBuilder.EntitySet<Smoke>("Smokes");
            modelBuilder.EntitySet<Note>("Notes");
            modelBuilder.EntitySet<NoteBody>("NoteBodies");
            modelBuilder.EntitySet<Comment>("Comments");
            var model = modelBuilder.GetEdmModel();

            config.Routes.MapODataServiceRoute("OData", "odata", model);

        }
    }
    public class BatchHandler : HttpMessageHandler
    {
        HttpMessageInvoker _server;

        public BatchHandler(HttpConfiguration config)
        {
            _server = new HttpMessageInvoker(new HttpServer(config));
        }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            // Return 400 for the wrong MIME type
            if ("multipart/batch" !=
                request.Content.Headers.ContentType.MediaType)
            {
                return request.CreateResponse(HttpStatusCode.BadRequest);
            }

            // Start a multipart response
            var outerContent = new MultipartContent("batch");
            var outerResp = request.CreateResponse();
            outerResp.Content = outerContent;

            // Read the multipart request
            var multipart = await request.Content.ReadAsMultipartAsync();

            foreach (var httpContent in multipart.Contents)
            {
                HttpResponseMessage innerResp = null;

                try
                {
                    // Decode the request object
                    var innerReq = await
                        httpContent.ReadAsHttpRequestMessageAsync();

                    // Send the request through the pipeline
                    innerResp = await _server.SendAsync(
                        innerReq,
                        cancellationToken
                    );
                }
                catch (Exception)
                {
                    // If exceptions are thrown, send back generic 400
                    innerResp = new HttpResponseMessage(
                        HttpStatusCode.BadRequest
                    );
                }

                // Wrap the response in a message content and put it
                // into the multipart response
                outerContent.Add(new HttpMessageContent(innerResp));
            }

            return outerResp;
        }
    }
}
