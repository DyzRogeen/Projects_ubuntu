using Microsoft.EntityFrameworkCore;
using MyAdminStation.Models;

namespace MyAdminStation.Data
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

        public DbSet<BatteryStat> BatteryStats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BatteryStat>().ToTable("battery");
        }
    }
}