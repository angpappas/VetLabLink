// <copyright file="Settings.cs" company="Smartcode">
// Copyright (c) Smartcode. All rights reserved.
// </copyright>

namespace VetLIS.Data
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations.Schema;

    public class Settings
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int Hl7Port { get; set; }

        public byte[]? Logo { get; set; }

        public string? ExtraInformation { get; set; }

        public static implicit operator Settings(List<Settings> v)
        {
            throw new NotImplementedException();
        }
    }
}