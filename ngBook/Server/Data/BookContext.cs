using ngBook.Server.Models;
using System.Data.Entity;

namespace ngBook.Server.Data
{
    public class BookContext : System.Data.Entity.DbContext
    {
        public BookContext()
            : base(nameOrConnectionString: "ngBook")
        {
            Configuration.ProxyCreationEnabled = false;
            Configuration.LazyLoadingEnabled = false;
            Configuration.AutoDetectChangesEnabled = true;
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<Collection> Collections { get; set; }
        public DbSet<FavoriteList> FavoriteLists { get; set; }

    }
}