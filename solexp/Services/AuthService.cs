using solexp.Model;
using solexp.Repository;

namespace solexp.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IClientRepository _clientRepository;
        private readonly ITeacherRepository _teacherRepository;
        private readonly IAdminRepository _adminRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _jwtService;

        public AuthService(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IClientRepository clientRepository,
            ITeacherRepository teacherRepository,
            IAdminRepository adminRepository,
            IPasswordHasher passwordHasher,
            IJwtTokenGenerator jwtService)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _clientRepository = clientRepository;
            _teacherRepository = teacherRepository;
            _adminRepository = adminRepository;
            _passwordHasher = passwordHasher;
            _jwtService = jwtService;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null)
                throw new UnauthorizedAccessException("Неверный email или пароль");

            if (!_passwordHasher.Verify(dto.Password, user.password))
                throw new UnauthorizedAccessException("Неверный email или пароль");

            // Получаем роль отдельным запросом по id_role
            var role = await _roleRepository.GetByIdAsync(user.id_role);
            if (role == null)
                throw new InvalidOperationException("Роль пользователя не найдена");

            int roleSpecificId = 0;
            string name = null;
            switch (role.role_name)
            {
                case "Client":
                    var client = await _clientRepository.GetByUserIdAsync(user.id_user);
                    name = client?.full_name;
                    roleSpecificId = client.id_client;
                    break;
                case "Teacher":
                    var teacher = await _teacherRepository.GetByUserIdAsync(user.id_user);
                    name = teacher?.full_name;
                    roleSpecificId = teacher.id_teacher;
                    break;
                case "Admin":
                    var admin = await _adminRepository.GetByUserIdAsync(user.id_user);
                    name = admin?.full_name;
                    roleSpecificId = admin.id_admin;
                    break;
            }

            var token = _jwtService.GenerateToken(user.email, role.role_name, user.id_user, roleSpecificId);

            return new AuthResponseDto
            {
                Token = token,
                Email = user.email,
                Role = role.role_name,
                Name = name
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            // Проверяем, что регистратор - администратор
            //var adminUser = await _userRepository.GetByIdAsync(adminId);
            //if (adminUser == null)
            //    throw new UnauthorizedAccessException("Администратор не найден");

            //// Получаем роль администратора отдельным запросом
            //var adminRole = await _roleRepository.GetByIdAsync(adminUser.id_role);
            //if (adminRole?.role_name != "Admin")
            //    throw new UnauthorizedAccessException("Только администратор может регистрировать пользователей");

            // Проверяем существование email
            if (await _userRepository.ExistsByEmailAsync(dto.Email))
                throw new InvalidOperationException("Пользователь с таким email уже существует");

            // Получаем роль для нового пользователя
            var role = await _roleRepository.GetByNameAsync(dto.RoleName);
            if (role == null)
                throw new InvalidOperationException("Указанная роль не существует");

            // Создаем пользователя
            var user = new User
            {
                email = dto.Email,
                password = _passwordHasher.Generate(dto.Password),
                id_role = role.id_role
            };

            await _userRepository.CreateAsync(user);
            // Создаем соответствующую запись в зависимости от роли
            switch (dto.RoleName)
            {
                case "Client":
                    await _clientRepository.CreateAsync(new Client
                    {
                        id_user = user.id_user,
                        full_name = dto.Name,
                        phone_number = dto.PhoneNumber
                    });
                    break;
                case "Teacher":
                    await _teacherRepository.CreateAsync(new Teacher
                    {
                        id_user = user.id_user,
                        full_name = dto.Name,
                        phone_number = dto.PhoneNumber
                    });
                    break;
                case "Admin":
                    await _adminRepository.CreateAsync(new Admin
                    {
                        id_user = user.id_user,
                        full_name = dto.Name,
                        phone_number = dto.PhoneNumber
                    });
                    break;
            }

            // Возвращаем токен для нового пользователя
            //var token = _jwtService.GenerateToken(user.email, role.role_name, user.id_user);

            return new AuthResponseDto
            {
                Token = "-",
                Email = user.email,
                Role = role.role_name,
                Name = dto.Name
            };
        }
    }
}