// <copyright file="TestParameterSettingsController.cs" company="Smartcode">
// Copyright (c) Smartcode. All rights reserved.
// </copyright>

namespace VetLIS.Controllers
{
    using HL7.Dotnetcore;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using VetLIS.Data;
    using VetLIS.Models;

    [ApiController]
    [Route("api/[controller]")]
    public class TestParameterSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext db;

        public TestParameterSettingsController(ApplicationDbContext dbContext)
        {
            this.db = dbContext;
        }

        [HttpGet]
        [Route("GetAll")]
        public async Task<ActionResult<IEnumerable<TestParameterSetting>>> GetTestParameterSettings()
        {
            return await this.db.TestParameterSettings!.ToListAsync();
        }

        [HttpGet]
        [Route("TestParameterSettings/{parameter}")]
        public async Task<ActionResult<TestParameterSetting>> GetTestParameterSetting(string parameter)
        {
            var testParameterSetting = await this.db.TestParameterSettings!.FindAsync(parameter);

            if (testParameterSetting == null)
            {
                return this.NotFound();
            }

            return testParameterSetting;
        }

        [HttpPut]
        [Route("Put")]
        public async Task<IActionResult> PutTestParameterSetting(TestParameterSetting testParameterSetting)
        {
            this.db.Entry(testParameterSetting).State = EntityState.Modified;


            try
            {
                await this.db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!this.TestParameterSettingExists(testParameterSetting.Parameter))
                {
                    return this.NotFound();
                }
                else
                {
                    throw;
                }
            }

            return this.NoContent();
        }


        [HttpPost]
        [Route("PostAll")]
        public async Task<ActionResult<TestParameterSetting>> PostTestParameterSetting(TestParameterSetting testParameterSetting)
        {
            this.db.TestParameterSettings!.Add(testParameterSetting);
            try
            {
                await this.db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (this.TestParameterSettingExists(testParameterSetting.Parameter))
                {
                    return this.Conflict();
                }
                else
                {
                    throw;
                }
            }

            return this.CreatedAtAction(nameof(this.GetTestParameterSetting), new { parameter = testParameterSetting.Parameter }, testParameterSetting);
        }

        [HttpDelete]
        [Route("Delete/{parameter}")]
        public async Task<ActionResult> DeleteParameter(string parameter)
        {
            var prm = await this.db.TestParameterSettings!.FindAsync(parameter);
            if (prm == null)
            {
                return this.Ok(false);
            }

            try
            {
                this.db.TestParameterSettings.Remove(prm);
                await this.db.SaveChangesAsync();
                return this.Ok(new { Message = "Message deleted successfully!" });
            }
            catch (Exception)
            {
                return this.Ok(false);
            }
        }

        private bool TestParameterSettingExists(string parameter)
        {
            return this.db.TestParameterSettings!.Any(e => e.Parameter == parameter);
        }
    }
}