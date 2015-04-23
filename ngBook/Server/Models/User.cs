using System;

namespace ngBook.Server.Models
{
    public class User: Entity
    {
        public User()
        {
            
        }

        public int Id { get; set; }

        public string Username { get; set; }
        
        public string EmailAddress { get; set; }
        
        public string Firstname { get; set; }
        
        public string Lastname { get; set; }
        
        public string Password { get; set; }

        public DateTime? CreatedDateTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}