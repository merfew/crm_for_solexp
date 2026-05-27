using ksolexp.Model;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using solexp;
using solexp.Model;
using solexp.Repository;
using solexp.Services;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Security.Claims;
using static solexp.JwtTokenGenerator;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

// Configure Swagger with proper setup
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CRM API",
        Version = "v1",
        Description = "API for CRM system"
    });

    // Настройка JWT Bearer авторизации для Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by a space and your JWT token.\n\nExample: 'Bearer eyJhbGciOiJIUzI1NiIs...'"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var authOptions = new AuthOptions(builder.Configuration);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
     .AddJwtBearer(options =>
     {
         options.TokenValidationParameters = new TokenValidationParameters
         {
             ValidateIssuer = true,
             ValidIssuer = authOptions.ISSUER,
             ValidateAudience = true,
             ValidAudience = authOptions.AUDIENCE,
             ValidateLifetime = true,
             IssuerSigningKey = authOptions.GetSymmetricSecurityKey(),
             ValidateIssuerSigningKey = true,
             RoleClaimType = ClaimTypes.Role
         };
     });

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>();

builder.Services.AddSingleton(authOptions);

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<ITeacherRepository, TeacherRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<ILessonRepository, LessonRepository>();
builder.Services.AddScoped<ICoursRepository, CoursRepository>();
builder.Services.AddScoped<ILessonStudentRepository, LessonStudentRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IAccountTransactionRepository, AccountTransactionRepository>();

builder.Services.AddScoped<IPasswordHasher, HashPassword>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<IClientService, ClientService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Shopping List API V1");
        c.RoutePrefix = "swagger"; // Serve Swagger UI at /swagger
    });
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed Super Admin before running the application
using (var scope = app.Services.CreateScope())
{
    var adminService = scope.ServiceProvider.GetRequiredService<IAdminService>();
    try
    {
        await adminService.SeedSuperAdminAsync();
        Console.WriteLine("Super admin seeding completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error seeding super admin: {ex.Message}");
        throw ex;
    }
}

app.Run();