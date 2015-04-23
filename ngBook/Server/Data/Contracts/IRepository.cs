using System;
using System.Linq;

namespace ngBook.Server.Data
{
    public interface IRepository<T>: IDisposable
    {
        IQueryable<T> GetAll();
        T GetById(int id);
        void Add(T entity);
        void Update(T entity);
        void Delete(T entity);
        void Delete(int id);
        void SaveChanges();
    }
}
