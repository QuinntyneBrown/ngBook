using System;
using System.Collections.Generic;
using System.Linq;
using ngBook.Server.Config;
using ngBook.Server.Data;
using ngBook.Server.Dtos;
using ngBook.Server.Services.Contracts;

namespace ngBook.Server.Services
{
    public class IdentityService: IIdentityService
    {
        public IdentityService(IUserRepository userRepository, IEncryptionService encryptionService)
        {
            this.userRepository = userRepository;
            this.encryptionService = encryptionService;
        }

        public bool ValidateUser(string usermame, string password)
        {
            return this.userRepository.GetAll().Where(x => x.Username == usermame && x.Password == password).Count() > 0;
        }
        public TokenDto TryToRegister(RegistrationRequestDto registrationRequestDto)
        {
            throw new NotImplementedException();
        }

        public bool AuthenticateUser(string username, string password)
        {
            if (userRepository.GetAll().FirstOrDefault(x => x.Username == username && !x.IsDeleted) != null)
            {
                if (SecurityConfiguration.Config.StorePasswordsInPlainText)
                    return ValidateUser(username, password);

                var transformedPassword = encryptionService.TransformPassword(password);

                return ValidateUser(username, transformedPassword);
            }

            return false;
        }

        public ICollection<System.Security.Claims.Claim> GetClaimsForUser(string username)
        {
            var claims = new List<System.Security.Claims.Claim>();
            
            claims.Add(new System.Security.Claims.Claim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name", username));
            
            return claims;
        }

        protected IUserRepository userRepository { get; set; }

        protected IEncryptionService encryptionService { get; set; }
    }
}