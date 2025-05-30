﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using VetLIS.Data;

#nullable disable

namespace VetLIS.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20241003095449_settings")]
    partial class settings
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.6");

            modelBuilder.Entity("VetLIS.Data.Analyzer", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("ApplicationType")
                        .HasColumnType("INTEGER");

                    b.Property<string>("IP")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("Settings")
                        .HasMaxLength(2048)
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Analyzers");
                });

            modelBuilder.Entity("VetLIS.Data.Hl7Message", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("ApplicationType")
                        .HasColumnType("INTEGER");

                    b.Property<int>("Category")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Message")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("MessageDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("Overrides")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("ReceivedOn")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Messages");
                });

            modelBuilder.Entity("VetLIS.Data.Settings", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("ExtraInformation")
                        .HasColumnType("TEXT");

                    b.Property<int>("Hl7Port")
                        .HasColumnType("INTEGER");

                    b.Property<byte[]>("Logo")
                        .HasColumnType("BLOB");

                    b.HasKey("Id");

                    b.ToTable("Settings");
                });

            modelBuilder.Entity("VetLIS.Data.TestParameterSetting", b =>
                {
                    b.Property<string>("Parameter")
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("Function")
                        .IsRequired()
                        .HasMaxLength(8192)
                        .HasColumnType("TEXT");

                    b.HasKey("Parameter");

                    b.ToTable("TestParameterSettings");
                });
#pragma warning restore 612, 618
        }
    }
}
