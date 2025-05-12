// <copyright file="SettingsView.cs" company="Smartcode">
// Copyright (c) Smartcode. All rights reserved.
// </copyright>

namespace VetLIS.Models
{
    public class SettingsView
    {
        public int Hl7Port { get; set; }

        public string IP { get; set; }

        public byte[]? Logo { get; set; }

        public string? ExtraInformation { get; set; }

        public string[] ServerErrors { get; set; }
    }
}
