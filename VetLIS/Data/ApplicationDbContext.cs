// <copyright file="ApplicationDbContext.cs" company="Smartcode">
// Copyright (c) Smartcode. All rights reserved.
// </copyright>

namespace VetLIS.Data
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Options;

    public class ApplicationDbContext : DbContext
    {
        private readonly IConfiguration conf;

        public ApplicationDbContext(IConfiguration configuration)
        {
            this.conf = configuration;
        }

        public DbSet<Hl7Message>? Messages { get; set; }

        public DbSet<TestParameterSetting>? TestParameterSettings { get; set; }

        public DbSet<Settings>? Settings { get; set; }

        public DbSet<Analyzer> Analyzers { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);

            var targetDbPath = Path.Combine(System.Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "VetLabLink", "vetlis.db");
            var connectionString = $"Data Source={targetDbPath}";

            optionsBuilder.UseSqlite(connectionString);
        }
    }
}
