using Microsoft.EntityFrameworkCore;
using solexp.Model;
using System.Data;
using System.Security.Cryptography.Xml;

namespace ksolexp.Model
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Cours> Courses { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Lesson_student> LessonStudents { get; set; }
        public DbSet<Account_transaction> AccountTransactions { get; set; }

        private readonly IConfiguration _configuration;

        public AppDbContext(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                optionsBuilder.UseNpgsql(connectionString);
            }
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>().HasKey(h => h.id_user);
            modelBuilder.Entity<Role>().HasKey(h => h.id_role);
            modelBuilder.Entity<Teacher>().HasKey(h => h.id_teacher);
            modelBuilder.Entity<Client>().HasKey(h => h.id_client);
            modelBuilder.Entity<Admin>().HasKey(h => h.id_admin);
            modelBuilder.Entity<Lesson>().HasKey(h => h.id_lesson);
            modelBuilder.Entity<Cours>().HasKey(h => h.id_cours);
            modelBuilder.Entity<Student>().HasKey(h => h.id_student);
            modelBuilder.Entity<Lesson_student>().HasKey(h => h.id_lesson_student);
            modelBuilder.Entity<Account_transaction>().HasKey(h => h.id_transaction);
        }
    }
}
