// <copyright file="Analyzer.cs" company="Smartcode">
// Copyright (c) Smartcode. All rights reserved.
// </copyright>

namespace VetLIS.Data
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using static VetLIS.Data.Hl7Message;

    public class Analyzer
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public ApplicationTypes ApplicationType { get; set; }

        [MaxLength(100)]
        [Required]
        public string IP { get; set; } = string.Empty;

        [MaxLength(2048)]
        public string? Settings { get; set; }
    }
}