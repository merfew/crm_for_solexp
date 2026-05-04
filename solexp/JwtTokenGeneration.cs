using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using solexp.Model;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace solexp
{
    public class JwtTokenGenerator : IJwtTokenGenerator
    {
        private readonly AuthOptions _authOptions;

        public JwtTokenGenerator(IConfiguration configuration)
        {
            _authOptions = new AuthOptions(configuration);
        }

        public class AuthOptions
        {
            public string? ISSUER { get; set; }
            public string? AUDIENCE { get; set; }
            public string? KEY { get; set; }

            public AuthOptions(IConfiguration configuration)
            {
                ISSUER = configuration.GetValue<string>("JwtSettings:Issuer");
                AUDIENCE = configuration.GetValue<string>("JwtSettings:Audience");
                KEY = configuration.GetValue<string>("JwtSettings:SecretKey");
            }

            public SymmetricSecurityKey GetSymmetricSecurityKey()
            {
                return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(KEY!));
            }
        }

        public string GenerateToken(string? username, string? role, int roleId)
        {
            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role),
            new Claim(ClaimTypes.NameIdentifier, roleId.ToString()),
            //new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            //new Claim(ClaimTypes.UserData, roleId.ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

            var token = new JwtSecurityToken(
                issuer: _authOptions.ISSUER,
                audience: _authOptions.AUDIENCE,
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: new SigningCredentials(_authOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256));

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
    public interface IJwtTokenGenerator
    {
        string GenerateToken(string? username, string? role, int roleId);
    }
}
