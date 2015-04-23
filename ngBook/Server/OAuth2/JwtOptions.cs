using Microsoft.Owin.Security.Jwt;
using ngBook.Server.Config;

namespace ngBook.Server.OAuth2
{
    public class JwtOptions : JwtBearerAuthenticationOptions
    {
        public JwtOptions()
        {
            var config = SecurityConfiguration.Config;

            AllowedAudiences = new[] { config.JwtAudience };
            IssuerSecurityTokenProviders = new[] 
            {
                new SymmetricKeyIssuerSecurityTokenProvider(config.JwtIssuer, config.JwtKey)
            };
        }
    }
}