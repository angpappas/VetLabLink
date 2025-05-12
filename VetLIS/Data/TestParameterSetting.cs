// <copyright file="TestParameterSetting.cs" company="Smartcode">
// Copyright (c) Smartcode. All rights reserved.
// </copyright>

namespace VetLIS.Data
{
    using System.ComponentModel.DataAnnotations;

    public class TestParameterSetting
    {
        [Key]
        [MaxLength(100)]
        required public string Parameter { get; set; }

        [MaxLength(8192)]
        required public string Function { get; set; }
    }
}
