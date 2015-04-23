using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using ngBook.Server.OAuth2;
using ngBook.Server.Services.Contracts;
using Microsoft.Owin.Cors;
using Microsoft.Practices.Unity;
using Owin;

[assembly: OwinStartup(typeof(ngBook.Server.StartUp.OwinStartUp))]

namespace ngBook.Server.StartUp
{
    public class OwinStartUp
    {
        public void Configuration(IAppBuilder app)
        {
            var identityService = UnityConfig.GetContainer().Resolve<IIdentityService>();
            app.UseOAuthAuthorizationServer(new OAuthOptions(identityService));
            app.UseJwtBearerAuthentication(new JwtOptions());
            app.UseCors(CorsOptions.AllowAll);
        }
    }
}
