using System.ComponentModel.DataAnnotations;

namespace SubscriptionTracker.Models;

/// <summary>Цикл оплати підписки.</summary>
public enum BillingCycle
{
    Monthly = 0,
    Yearly = 1,
    Weekly = 2,
    Quarterly = 3
}

/// <summary>Статус підписки.</summary>
public enum SubscriptionStatus
{
    Active = 0,
    Paused = 1,
    Cancelled = 2
}

/// <summary>Підписка / сервіс, який обліковує користувач.</summary>
public class Subscription
{
    public int Id { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Категорія: Стрімінг, Хостинг, Інструменти тощо.</summary>
    [MaxLength(60)]
    public string Category { get; set; } = "Інше";

    /// <summary>Вартість за один цикл оплати.</summary>
    public decimal Price { get; set; }

    /// <summary>Валюта у форматі ISO 4217 (UAH, USD, EUR ...).</summary>
    [MaxLength(3)]
    public string Currency { get; set; } = "UAH";

    public BillingCycle BillingCycle { get; set; } = BillingCycle.Monthly;

    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;

    /// <summary>Дата наступного списання.</summary>
    public DateOnly NextPaymentDate { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    [Required]
    [MaxLength(450)]
    public string UserId { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Website { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Нормалізована вартість за місяць — зручно для агрегатів.</summary>
    public decimal MonthlyCost => BillingCycle switch
    {
        BillingCycle.Weekly    => Price * 52m / 12m,
        BillingCycle.Monthly   => Price,
        BillingCycle.Quarterly => Price / 3m,
        BillingCycle.Yearly    => Price / 12m,
        _ => Price
    };
}
