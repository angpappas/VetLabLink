// <copyright file="SettingsController.cs" company="Smartcode">
// Copyright (c) Smartcode. All rights reserved.
// </copyright>

namespace VetLIS.Controllers
{
    using System.Net;
    using System.Net.Sockets;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.StaticFiles;
    using Microsoft.EntityFrameworkCore;
    using VetLIS.Data;
    using VetLIS.Models;
    using VetLIS.Models.Hl7Server;

    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext db;
        private readonly IEnumerable<IHostedService> services;

        public SettingsController(ApplicationDbContext dbContext, IEnumerable<IHostedService> services)
        {
            this.db = dbContext;
            this.services = services;
        }

        [HttpGet]
        [Route("GetSettings")]

        public async Task<SettingsView> Get()
        {
            var settings = await this.db.Settings.FirstOrDefaultAsync();
            var result = new SettingsView();

            var tcpServer = this.services.FirstOrDefault(x => x.GetType() == typeof(Hl7TcpListener)) as Hl7TcpListener;
            result.ServerErrors = tcpServer?.GetError() ?? Array.Empty<string>();
            result.Hl7Port = settings.Hl7Port;
            result.Logo = settings.Logo;
            result.IP = this.GetLocalIPAddress();
            result.ExtraInformation = settings.ExtraInformation;

            return result;
        }

        [HttpGet]
        [Route("ServerLog")]
        public async Task<IActionResult> GetServerLog()
        {
            var tcpServer = this.services.FirstOrDefault(x => x.GetType() == typeof(Hl7TcpListener)) as Hl7TcpListener;
            return this.Ok(new { Log = tcpServer?.GetServerLog() });
        }

        [HttpGet]
        [Route("GetLogo")]
        public async Task<IActionResult> GetLogo()
        {
            var settings = await this.db.Settings.FirstOrDefaultAsync();
            if (settings == null || settings.Logo == null)
            {
                return this.NotFound();
            }

            var contentTypeProvider = new FileExtensionContentTypeProvider();
            if (!contentTypeProvider.TryGetContentType("logo.png", out var contentType))
            {
                contentType = "application/octet-stream";
            }

            return this.File(settings.Logo, contentType);
        }

        [HttpDelete]
        [Route("DeleteLogo")]
        public async Task<IActionResult> DeleteLogo()
        {
            var settings = await this.db.Settings.FirstOrDefaultAsync();
            if (settings == null || settings.Logo == null)
            {
                return this.NotFound();
            }

            settings.Logo = null;
            await this.db.SaveChangesAsync();

            return this.Ok("Logo was deleted successfully!");
        }

        [HttpPost]
        [Route("Communication")]
        public async Task<IActionResult> PostCommunication(Data.Settings model)
        {
            if (model == null)
            {
                return this.BadRequest();
            }

            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            var dbSettings = await this.db.Settings.FirstOrDefaultAsync();
            if (dbSettings == null)
            {
                this.db.Settings.Add(model);
            }
            else
            {
                dbSettings.Hl7Port = model.Hl7Port;
            }

            await this.db.SaveChangesAsync();

            var tcpServer = this.services.FirstOrDefault(x => x.GetType() == typeof(Hl7TcpListener));
            if (tcpServer != null)
            {
                CancellationTokenSource cts = new CancellationTokenSource();
                CancellationToken token = cts.Token;
                await tcpServer.StopAsync(token);
                await tcpServer.StartAsync(token);
            }

            return this.Ok(dbSettings);
        }

        [HttpPost]
        [Route("UserInterface")]
        public async Task<IActionResult> PostUserInterface([FromForm] IFormFile? logo, [FromForm] string? extraInfo)
        {
            byte[]? filebyteArr = null;
            if (logo != null)
            {
                if (logo.Length > 8 * 1024 * 1024)
                {
                    return this.BadRequest("File size is exceeds the limit!");
                }

                if (!this.IsImage(logo))
                {
                    return this.BadRequest("Invalid file type!");
                }

                filebyteArr = new byte[logo.Length];
                using (var memoryStream = new MemoryStream())
                {
                    logo.OpenReadStream().CopyTo(memoryStream);
                    filebyteArr = memoryStream.ToArray();
                }
            }

            var dbSettings = await this.db.Settings.FirstOrDefaultAsync();
            if (dbSettings == null)
            {
                this.db.Settings.Add(new Settings() { Hl7Port = 12000, Logo = filebyteArr, ExtraInformation = extraInfo });
            }
            else
            {
                if (filebyteArr != null)
                {
                    dbSettings.Logo = filebyteArr;
                }

                dbSettings.ExtraInformation = extraInfo;
            }

            await this.db.SaveChangesAsync();
            return this.Ok(dbSettings);
        }

        private bool IsImage(IFormFile file)
        {
            var extensions = new[] { ".jpg", ".jpeg", ".png", ".bmp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            return extensions.Contains(fileExtension);
        }

        private string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }

            return "No network adapters with an IPv4 address in the system!";
        }
    }
}
