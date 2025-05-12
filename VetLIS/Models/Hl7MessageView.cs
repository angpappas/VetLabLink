// <copyright file="Hl7MessageView.cs" company="Smartcode">
// Copyright (c) Smartcode. All rights reserved.
// </copyright>

namespace VetLIS.Models
{
    using VetLIS.Data;

    public class Hl7MessageView
    {
        public IEnumerable<Hl7Message>? Data { get; set; }

        public int TotalRecords { get; set; }

        public int PageSize { get; set; }

        public int CurrentPage { get; set; }
    }
}
