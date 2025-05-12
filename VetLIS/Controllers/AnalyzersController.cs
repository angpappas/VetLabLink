// <copyright file="AnalyzersController.cs" company="Smartcode">
// Copyright (c) Smartcode. All rights reserved.
// </copyright>

namespace VetLIS.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.CodeAnalysis.CSharp.Syntax;
    using Microsoft.EntityFrameworkCore;
    using System.Text.RegularExpressions;
    using VetLIS.Data;
    using VetLIS.Models;

    [ApiController]
    [Route("api/[controller]")]
    public class AnalyzersController : ControllerBase
    {
        private readonly ApplicationDbContext db;

        public AnalyzersController(ApplicationDbContext dbContext)
        {
            this.db = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return this.Ok(await this.db.Analyzers.ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var analyzer = await this.db.Analyzers.FirstOrDefaultAsync(x => x.Id == id);
            if (analyzer == null)
            {
                return this.NotFound();
            }

            return this.Ok(analyzer);
        }

        [HttpPost]
        [Route("AddAnalyzer")]
        public async Task<IActionResult> Post(Analyzer model)
        {
            if (model == null)
            {
                return this.BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            var analyzer = new Analyzer
            {
                ApplicationType = model.ApplicationType,
                IP = ValidateIPAddress(model.IP),
                Settings = model.Settings,
            };

            if (analyzer.IP != string.Empty)
            {
                this.db.Analyzers.Add(analyzer);
                await this.db.SaveChangesAsync();

                return this.Ok(analyzer);
            }
            else
            {
                return this.BadRequest();
            }
        }

        [HttpPut("{id}")]
        public void Put(int id, Analyzer model)
        {
        }

        [HttpDelete]
        [Route("Delete/{id}")]
        public async Task<IActionResult> DeleteAnalyzer(int id)
        {
            var analyzer = await this.db.Analyzers.FindAsync(id);
            if (analyzer == null)
            {
                return this.NotFound();
            }

            try
            {
                this.db.Analyzers.Remove(analyzer);
                await this.db.SaveChangesAsync();
                return this.Ok(new { Message = "Analyzer was deleted successfully!" });
            }
            catch (Exception)
            {
                return this.Ok(false);
            }
        }

        private static string ValidateIPAddress(string ipAddress)
        {
            string pattern = @"^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$";
            if (Regex.IsMatch(ipAddress, pattern))
            {
                return ipAddress;
            }
            else
            {
                return string.Empty;
            }
        }
    }
}
