using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SubscriptionTracker.Data;
using SubscriptionTracker.DTOs;
using SubscriptionTracker.Models;
using SubscriptionTracker.Services;
using System.Security.Claims;

namespace SubscriptionTracker.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ExchangeRateService _exchange;

    public SubscriptionsController(AppDbContext db, ExchangeRateService exchange)
    {
        _db = db;
        _exchange = exchange;
    }

    private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

    /// <summary>Список усіх підписок.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SubscriptionResponse>>> GetAll()
    {
        var items = await _db.Subscriptions
            .Where(s => s.UserId == CurrentUserId)
            .OrderBy(s => s.NextPaymentDate)
            .ToListAsync();
        return Ok(items.Select(SubscriptionResponse.From));
    }

    /// <summary>Одна підписка за id.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SubscriptionResponse>> GetById(int id)
    {
        var item = await _db.Subscriptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == CurrentUserId);
        return item is null ? NotFound() : Ok(SubscriptionResponse.From(item));
    }

    /// <summary>Створити підписку.</summary>
    [HttpPost]
    public async Task<ActionResult<SubscriptionResponse>> Create(SubscriptionInput input)
    {
        var entity = new Subscription
        {
            Name = input.Name,
            Category = input.Category,
            Price = input.Price,
            Currency = input.Currency,
            BillingCycle = input.BillingCycle,
            Status = input.Status,
            NextPaymentDate = input.NextPaymentDate,
            Notes = input.Notes,
            Website = input.Website,
            UserId = CurrentUserId
        };
        _db.Subscriptions.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, SubscriptionResponse.From(entity));
    }

    /// <summary>Оновити підписку.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<SubscriptionResponse>> Update(int id, SubscriptionInput input)
    {
        var entity = await _db.Subscriptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == CurrentUserId);
        if (entity is null) return NotFound();

        entity.Name = input.Name;
        entity.Category = input.Category;
        entity.Price = input.Price;
        entity.Currency = input.Currency;
        entity.BillingCycle = input.BillingCycle;
        entity.Status = input.Status;
        entity.NextPaymentDate = input.NextPaymentDate;
        entity.Notes = input.Notes;
        entity.Website = input.Website;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(SubscriptionResponse.From(entity));
    }

    /// <summary>Видалити підписку.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.Subscriptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == CurrentUserId);
        if (entity is null) return NotFound();
        _db.Subscriptions.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Зведення витрат для дашборда.</summary>
    [HttpGet("/api/summary")]
    public async Task<ActionResult<SummaryResponse>> Summary([FromQuery] string baseCurrency = "UAH")
    {
        baseCurrency = baseCurrency.ToUpperInvariant();

        var active = await _db.Subscriptions
            .Where(s => s.Status == SubscriptionStatus.Active && s.UserId == CurrentUserId)
            .ToListAsync();

        decimal monthlyTotal = 0;
        foreach (var s in active)
        {
            decimal convertedCost = await _exchange.ConvertAsync(s.MonthlyCost, s.Currency, baseCurrency);
            monthlyTotal += convertedCost;
        }

        var byCategory = new Dictionary<string, decimal>();
        var categoryGroups = active.GroupBy(s => s.Category);
        foreach (var group in categoryGroups)
        {
            decimal categorySum = 0;
            foreach (var s in group)
            {
                categorySum += await _exchange.ConvertAsync(s.MonthlyCost, s.Currency, baseCurrency);
            }
            byCategory[group.Key] = Math.Round(categorySum, 2);
        }

        var summary = new SummaryResponse
        {
            TotalActive = active.Count,
            MonthlyTotal = Math.Round(monthlyTotal, 2),
            YearlyTotal = Math.Round(monthlyTotal * 12m, 2),
            BaseCurrency = baseCurrency,
            Rates = await _exchange.GetRatesAsync(),
            ByCategory = byCategory,
            UpcomingPayments = active
                .OrderBy(s => s.NextPaymentDate)
                .Take(5)
                .Select(SubscriptionResponse.From)
                .ToList()
        };
        return Ok(summary);
    }
}
