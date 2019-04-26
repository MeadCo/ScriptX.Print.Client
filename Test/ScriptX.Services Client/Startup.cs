using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;
using ScriptX.Services_Client.Authentication;

namespace ScriptX.Services_Client
{
    public class Startup
    {
        private IHostingEnvironment _hostingEnvironment;
        private readonly ILogger _logger;

        public Startup(IConfiguration configuration, IHostingEnvironment hostingEnvironment, ILogger<Startup> logger)
        {
            Configuration = configuration;
            _hostingEnvironment = hostingEnvironment;
            _logger = logger;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
          
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            services.AddHttpContextAccessor();

            IFileProvider scriptFileProvider = new PhysicalFileProvider(Path.Combine(_hostingEnvironment.ContentRootPath,"..\\..\\"));

            services.AddSingleton<IFileProvider>(scriptFileProvider);

            services.AddScoped<Authentication.IMockAuthentication, MockAuthentication>();

            // see: https://www.strathweb.com/2019/01/enabling-apicontroller-globally-in-asp-net-core-2-2/
            // on update to 2.2
            services.Configure<ApiBehaviorOptions>(o =>
            {
                o.InvalidModelStateResponseFactory = context =>
                {
                    // we just put back the first error as simple text 
                    //
                    // TODO: This needs updating so the client gets consistent output from all the implementations of error (e.g. below
                    // we are simply throwing out text as well rather than a { 'Message': messageText }
                    //
                    string message = context.ModelState.Where(e => e.Value.Errors.Count > 0).First().Value.Errors.First().ErrorMessage;

                    return new BadRequestObjectResult(new
                    {
                        Message = message
                    });
                };
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
            }
            else
            {
            }

            app.UseExceptionHandler(errorApp =>
            {
                errorApp.Run(async context =>
                {
                    context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                    context.Response.Headers[HeaderNames.AccessControlAllowOrigin] = "*";
                    context.Response.Headers[HeaderNames.CacheControl] = "no-cache";
                    context.Response.Headers[HeaderNames.Pragma] = "no-cache";
                    context.Response.Headers[HeaderNames.Expires] = "-1";
                    context.Response.Headers.Remove(HeaderNames.ETag);

                    context.Response.ContentType = "text/plain; charset=utf-8";

                    var exceptionHandlerPathFeature =
                        context.Features.Get<IExceptionHandlerPathFeature>();

                    // Use exceptionHandlerPathFeature to process the exception (for example, 
                    // logging), but do NOT expose sensitive error information directly to 
                    // the client.
                    _logger.LogError(exceptionHandlerPathFeature.Error, "Error handler returning exception");

                    string errorText = exceptionHandlerPathFeature.Error.Message;

                    context.Response.ContentLength = errorText.Length;
                    await context.Response.WriteAsync(errorText);

                });
            });

            app.UseStaticFiles();

            app.UseMvc();
        }
    }
}
