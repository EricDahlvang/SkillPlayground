﻿using Microsoft.Bot.Connector.Authentication;
using System.Configuration;
using System.Linq;

namespace EchoBot.Authentication
{
    public class SkillAuthenticationConfiguration : AuthenticationConfiguration
    {
        private const string AllowedCallersConfigKey = "AllowedCallers";
        public SkillAuthenticationConfiguration()
        {
            var allowedCallers = ConfigurationManager.AppSettings[AllowedCallersConfigKey].Split(',').Select(s=>s.Trim()).ToList();
            ClaimsValidator = new AllowedCallersClaimsValidator(allowedCallers);
        }
        
        public override ClaimsValidator ClaimsValidator { get => base.ClaimsValidator; set => base.ClaimsValidator = value; }
    }
}