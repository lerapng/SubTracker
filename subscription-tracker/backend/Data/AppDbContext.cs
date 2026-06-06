using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SubscriptionTracker.Models;

namespace SubscriptionTracker.Data;

public class AppDbContext : IdentityDbContext<IdentityUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Subscription>(e =>
        {
            e.Property(s => s.Price).HasColumnType("decimal(18,2)");
            // MonthlyCost — обчислювана властивість, у БД її не зберігаємо.
            e.Ignore(s => s.MonthlyCost);
        });
    }
}

/// <summary>Наповнення БД демо-даними при першому запуску.</summary>
public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        // Recreate DB in development to apply changes (Identity schema + Website column)
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();

        if (db.Users.Any()) return;

        var user = new IdentityUser
        {
            UserName = "demo@example.com",
            NormalizedUserName = "DEMO@EXAMPLE.COM",
            Email = "demo@example.com",
            NormalizedEmail = "DEMO@EXAMPLE.COM",
            EmailConfirmed = true,
            SecurityStamp = Guid.NewGuid().ToString("D")
        };

        var hasher = new PasswordHasher<IdentityUser>();
        user.PasswordHash = hasher.HashPassword(user, "Password123!");

        db.Users.Add(user);
        db.SaveChanges();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        db.Subscriptions.AddRange(
            new Subscription { Name = "Netflix", Category = "Стрімінг", Price = 9.99m, Currency = "USD", BillingCycle = BillingCycle.Monthly, NextPaymentDate = today.AddDays(7), UserId = user.Id, Website = "netflix.com" },
            new Subscription { Name = "Spotify", Category = "Музика", Price = 4.99m, Currency = "USD", BillingCycle = BillingCycle.Monthly, NextPaymentDate = today.AddDays(15), UserId = user.Id, Website = "spotify.com" },
            new Subscription { Name = "GitHub Pro", Category = "Інструменти", Price = 4.00m, Currency = "USD", BillingCycle = BillingCycle.Monthly, NextPaymentDate = today.AddMonths(4), UserId = user.Id, Website = "github.com" },
            new Subscription { Name = "Хостинг DigitalOcean", Category = "Хостинг", Price = 250m, Currency = "UAH", BillingCycle = BillingCycle.Monthly, NextPaymentDate = today.AddDays(3), UserId = user.Id, Website = "digitalocean.com" }
        );
        db.SaveChanges();
    }
}
