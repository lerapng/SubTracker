using System.ComponentModel.DataAnnotations;
using SubscriptionTracker.Models;

namespace SubscriptionTracker.DTOs;

/// <summary>Дані для створення/оновлення підписки.</summary>
public class SubscriptionInput
{
    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(60)]
    public string Category { get; set; } = "Інше";

    [Range(0, 1_000_000)]
    public decimal Price { get; set; }

    [MaxLength(3)]
    public string Currency { get; set; } = "UAH";

    public BillingCycle BillingCycle { get; set; } = BillingCycle.Monthly;
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
    public DateOnly NextPaymentDate { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    [MaxLength(200)]
    public string? Website { get; set; }
}

/// <summary>Підписка у відповіді API.</summary>
public class SubscriptionResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string BillingCycle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateOnly NextPaymentDate { get; set; }
    public string? Notes { get; set; }
    public string? Website { get; set; }
    public decimal MonthlyCost { get; set; }

    public static SubscriptionResponse From(Subscription s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Category = s.Category,
        Price = s.Price,
        Currency = s.Currency,
        BillingCycle = s.BillingCycle.ToString(),
        Status = s.Status.ToString(),
        NextPaymentDate = s.NextPaymentDate,
        Notes = s.Notes,
        Website = s.Website,
        MonthlyCost = Math.Round(s.MonthlyCost, 2)
    };
}

/// <summary>Зведена статистика для дашборда.</summary>
public class SummaryResponse
{
    public int TotalActive { get; set; }
    public decimal MonthlyTotal { get; set; }
    public decimal YearlyTotal { get; set; }
    public string BaseCurrency { get; set; } = "UAH";
    public Dictionary<string, decimal> Rates { get; set; } = new();
    public Dictionary<string, decimal> ByCategory { get; set; } = new();
    public List<SubscriptionResponse> UpcomingPayments { get; set; } = new();
}
