// <copyright file="MessagesController.cs" company="Smartcode">
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
    public class MessagesController : ControllerBase
    {
        private readonly ApplicationDbContext db;

        public MessagesController(ApplicationDbContext dbContext)
        {
            this.db = dbContext;
        }

        [HttpGet]
        public async Task<Hl7MessageView> Get(int page, int pageSize, Hl7Message.MessageCategories category)
        {
            var result = new Hl7MessageView();

            result.Data = await this.db.Messages!.
                Where(x => x.Category == category).
                OrderByDescending(x => x.MessageDate).
                Skip(pageSize * page).
                Take(pageSize).
                ToListAsync();

            result.TotalRecords = await this.db.Messages!.Where(x => x.Category == category).CountAsync();
            result.PageSize = pageSize;
            result.CurrentPage = page;

            return result;
        }

        [HttpGet]
        [Route("GetAll")]
        public async Task<Hl7MessageView> GetAll(int page, int pageSize, int? patientId = null)
        {
            var result = new Hl7MessageView();

            result.Data = await this.db.Messages!.
                OrderByDescending(x => x.MessageDate).
                Skip(pageSize * page).
                Take(pageSize).
                ToListAsync();
            result.TotalRecords = await this.db.Messages!.CountAsync();
            return result;
        }

        [HttpGet]
        [Route("LastMessageId")]
        public async Task<ActionResult<int?>> GetLastMessageId(Hl7Message.MessageCategories category)
        {
            var lastMessageId = await this.db.Messages!.Where(x => x.Category == category).OrderByDescending(x => x.Id).Select(x => x.Id).FirstOrDefaultAsync();

            return this.Ok(lastMessageId);
        }

        [HttpGet]
        [Route("Details/{id}")]
        public async Task<ActionResult<MessageDetails>> GetMessage(int id)
        {
            var msg = await this.db.Messages!.FindAsync(id);
            if (msg == null)
            {
                return this.NotFound();
            }

            var previousItem = await this.db.Messages!
                .Where(i => i.MessageDate < msg.MessageDate && i.Category == msg!.Category)
                .OrderByDescending(x => x.MessageDate)
                .Take(1)
                .Select(i => i.Id)
                .FirstOrDefaultAsync();

            var nextItem = await this.db.Messages!
                .Where(i => i.MessageDate > msg.MessageDate && i.Category == msg!.Category)
                .OrderBy(x => x.MessageDate)
                .Take(1)
                .Select(i => i.Id)
                .FirstOrDefaultAsync();

            int totalRecords = this.db.Messages!.Where(x => x.Category == msg!.Category).Count();

            int currentRecord = this.db.Messages!.Where(e => e.Id <= id && e.Category == msg!.Category).OrderBy(e => e.Id).Count();

            return this.Ok(new MessageDetails
            {
                Message = msg!,
                Previous = previousItem,
                Next = nextItem,
                TotalRecords = totalRecords,
                CurrentRecord = currentRecord,
            });
        }

        [HttpPut]
        [Route("UpdateOverrides/{id}")]
        public async Task<ActionResult> UpdateMessage(int id, [FromBody] OverrideModel model)
        {
            var message = await this.db.Messages!.FindAsync(id);
            if (message == null)
            {
                return this.NotFound($"Message {id} not found!");
            }

            message.Overrides = model.Overrides;
            await this.db.SaveChangesAsync();
            return this.Ok(message.Overrides);
        }

        [HttpDelete]
        [Route("Delete/{id}")]
        public async Task<ActionResult> DeleteMessage(int id)
        {
            var message = await this.db.Messages!.FindAsync(id);
            if (message == null)
            {
                return this.Ok(false);
            }

            try
            {
                this.db.Messages.Remove(message);
                await this.db.SaveChangesAsync();
                return this.Ok(new { Message = "Message deleted successfully!" });
            }
            catch (Exception)
            {
                return this.Ok(false);
            }
        }

        public class OverrideModel
        {
            public string? Overrides { get; set; }
        }

        public class MessageDetails
        {
            required public Hl7Message Message { get; set; }

            public int Next { get; set; }

            public int Previous { get; set; }

            public int TotalRecords { get; set; }

            public int CurrentRecord { get; set; }
        }
    }
}