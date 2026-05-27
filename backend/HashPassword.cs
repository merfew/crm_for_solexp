namespace solexp
{
    public class HashPassword: IPasswordHasher
    {
        public string Generate(string? password) =>
            BCrypt.Net.BCrypt.EnhancedHashPassword(password);

        public bool Verify(string? password, string? hashPassword) =>
            BCrypt.Net.BCrypt.EnhancedVerify(password, hashPassword);
    }
    public interface IPasswordHasher
    {
        string Generate(string? password);
        bool Verify(string? password, string? hashPassword);
    }
}
