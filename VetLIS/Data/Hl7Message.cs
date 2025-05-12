// <copyright file="Hl7Message.cs" company="Smartcode">
// Copyright (c) Smartcode. All rights reserved.
// </copyright>

namespace VetLIS.Data
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class Hl7Message
    {
        public enum ApplicationTypes
        {
            Unknown = 0,
            DH56WoodleyInsightViaPlus = 10,
            GenruiVH30 = 20,
            CelercareVInsightVChem = 30,
            WoodleyInsightV3Plus = 40,
            Smt120V = 50,
        }

        public enum MessageCategories
        {
            Unknown = 0,
            Hematology = 1,
            Biochemistry = 2,
            ImmunoAssay = 3,
        }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public ApplicationTypes ApplicationType { get; set; }

        public MessageCategories Category { get; set; }

        public DateTime ReceivedOn { get; set; }

        public DateTime MessageDate { get; set; }

        public string? Overrides { get; set; }

        [Required]
        public string Message { get; set; } = string.Empty;
    }
}
