using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;

namespace SubscriptionTracker.Services;

public class ExchangeRateResponse
{
    [JsonPropertyName("result")]
    public string Result { get; set; } = string.Empty;

    [JsonPropertyName("base_code")]
    public string BaseCode { get; set; } = string.Empty;

    [JsonPropertyName("rates")]
    public Dictionary<string, decimal> Rates { get; set; } = new();
}

public class ExchangeRateService
{
    private readonly HttpClient _http;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "ExchangeRates";

    public ExchangeRateService(HttpClient http, IMemoryCache cache)
    {
        _http = http;
        _cache = cache;
    }

    public async Task<Dictionary<string, decimal>> GetRatesAsync()
    {
        if (_cache.TryGetValue(CacheKey, out Dictionary<string, decimal>? cachedRates) && cachedRates != null)
        {
            return cachedRates;
        }

        try
        {
            var response = await _http.GetFromJsonAsync<ExchangeRateResponse>("https://open.er-api.com/v6/latest/UAH");
            if (response != null && response.Result == "success")
            {
                // Cache rates for 12 hours
                _cache.Set(CacheKey, response.Rates, TimeSpan.FromHours(12));
                return response.Rates;
            }
        }
        catch
        {
            // API call failed, fallback
        }

        // Return fallback rates (UAH based, 1 UAH is ...)
        return new Dictionary<string, decimal>
        {
            { "UAH", 1.0m },
            { "USD", 0.0245m }, // ~40.8 UAH/USD
            { "EUR", 0.0227m }, // ~44 UAH/EUR
        };
    }

    public async Task<decimal> ConvertAsync(decimal amount, string fromCurrency, string toCurrency)
    {
        if (string.IsNullOrWhiteSpace(fromCurrency) || string.IsNullOrWhiteSpace(toCurrency))
            return amount;

        fromCurrency = fromCurrency.ToUpperInvariant();
        toCurrency = toCurrency.ToUpperInvariant();

        if (fromCurrency == toCurrency)
            return amount;

        var rates = await GetRatesAsync();

        if (!rates.TryGetValue(fromCurrency, out decimal fromRate) || !rates.TryGetValue(toCurrency, out decimal toRate))
        {
            return amount; // Return unconverted if currency isn't supported
        }

        // amountInUah = amount / fromRate
        // amountInTo = amountInUah * toRate = amount / fromRate * toRate
        if (fromRate == 0) return 0;
        return amount / fromRate * toRate;
    }
}
