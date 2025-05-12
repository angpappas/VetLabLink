// <copyright file="Program.cs" company="Smartcode">
// Copyright (c) Smartcode. All rights reserved.
// </copyright>

using System.Diagnostics;
using System.Threading;
using Microsoft.EntityFrameworkCore;
using VetLIS;
using VetLIS.Data;
using VetLIS.Models.Hl7Server;

public class Program
{
    private static Mutex mutex = null;

    public static void Main(string[] args)
    {
        const string appName = "VetLIS";
        bool createdNew;

        mutex = new Mutex(true, appName, out createdNew);

        if (!createdNew)
        {
            // The application is already running
            return;
        }

        var builder = WebApplication.CreateBuilder(args);

        var sourceDbPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "AppData", "vetlis.db");
        var targetDbPath = Path.Combine(System.Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "VetLabLink", "vetlis.db");
        if (!File.Exists(targetDbPath))
        {
            Directory.CreateDirectory(Path.GetDirectoryName(targetDbPath));
            File.Copy(sourceDbPath, targetDbPath);
        }

        var connectionString = $"Data Source={targetDbPath}";

        builder.Services.AddControllersWithViews();

        builder.Services.AddSpaStaticFiles(configuration =>
        {
            configuration.RootPath = "vet-lis/build";
        });

        builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppConfiguration"));
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlite(connectionString));

        builder.Services.AddHostedService<Hl7TcpListener>();

        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddSwaggerGen();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (!app.Environment.IsDevelopment())
        {
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseSpaStaticFiles();
        app.UseRouting();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllerRoute(
                name: "default",
                pattern: "{controller}/{action}/{id?}");
        });

        app.UseSpa(spa =>
        {
            spa.Options.SourcePath = "vet-lis";
            if (app.Environment.IsDevelopment())
            {
                spa.UseProxyToSpaDevelopmentServer("http://localhost:3000/");
            }
        });

        app.Run();
    }
}
