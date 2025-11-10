using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

using Microsoft.EntityFrameworkCore;
using MyAdminStation.Data;

var builder = WebApplication.CreateBuilder(args);

// Connection PostgreSQL
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtSecret = builder.Configuration["JWT_SECRET"] ?? "";
var certPath = builder.Configuration["CERT_PATH"] ?? null;
var certPassword = builder.Configuration["CERT_PWD"] ?? null;

builder.Services.AddControllers();
builder.Services.AddHttpClient();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// var key = Encoding.UTF8.GetBytes(jwtSecret);
// builder.Services.AddAuthentication(options =>
// {
//     options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//     options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
// })
// .AddJwtBearer(options =>
// {
//     options.RequireHttpsMetadata = true;
//     options.SaveToken = true;
//     options.TokenValidationParameters = new TokenValidationParameters
//     {
//         ValidateIssuer = false,
//         ValidateAudience = false,
//         ValidateIssuerSigningKey = true,
//         IssuerSigningKey = new SymmetricSecurityKey(key)
//     };
// });

var app = builder.Build();

app.UseAuthentication();
//app.UseAuthorization();
app.UseCors("AllowAll");
app.MapControllers();

// if (!string.IsNullOrEmpty(certPath) && !string.IsNullOrEmpty(certPassword))
// {
//     app.Urls.Clear();
//     app.Urls.Add("https://localhost:5001");
//     app.Logger.LogInformation("Using cert at {0}", certPath);
//     app.Run(async ctx => await Task.CompletedTask);
// }

app.Run();