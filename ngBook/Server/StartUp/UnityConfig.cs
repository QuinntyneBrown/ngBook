using Microsoft.Practices.Unity;
using System.Web.Http;
using ngBook.Server.Config;
using ngBook.Server.Data;
using ngBook.Server.Models;
using ngBook.Server.Services;
using ngBook.Server.Services.Contracts;
using Unity.WebApi;

namespace ngBook.Server.StartUp
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
            var container = GetContainer();
            GlobalConfiguration.Configuration.DependencyResolver = new UnityDependencyResolver(container);
        }

        public static UnityContainer GetContainer()
        {
            var container = new UnityContainer();

            container.RegisterType<IRepository<Book>, ngBook.Server.Data.EFRepository<Book>>();
            container.RegisterType<IUserRepository, ngBook.Server.Data.UserRepository>();

            container.RegisterType<ngBook.Server.Data.BookContext>();
            container.RegisterType<IIdentityService, IdentityService>();
            container.RegisterType<IEncryptionService, EncryptionService>();

            return container;
        }

    }
}