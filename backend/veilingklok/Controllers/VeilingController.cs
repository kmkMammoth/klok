using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace veilingklok;

// ✅ DTO for creating auctions with products
public class ProductInAuction
{
    public int productId { get; set; }
    public decimal startPrice { get; set; } // Startprijs
    public decimal priceReductionAmount { get; set; } // Prijsreductie bedrag (euro)
    public int priceReductionInterval { get; set; } // Prijsreductie interval (seconden)
}

public class CreateAuctionRequest
{
    public string name { get; set; }
    public int veilingmeesterId { get; set; }
    public DateTime startTime { get; set; }
    public DateTime endTime { get; set; }
    public string adres { get; set; }  // Veiling locatie/adres
    public List<ProductInAuction> products { get; set; } = new();
}

// ✅ DTO for auction response
public class AuctionProductResponse
{
    public int productId { get; set; }
    public string name { get; set; }
    public decimal startPrice { get; set; }
    public decimal currentPrice { get; set; }
    public decimal priceReductionAmount { get; set; }
    public int priceReductionInterval { get; set; }
    public int? quantity { get; set; }
    public decimal? potmaat { get; set; }
    public decimal? steellengte { get; set; }
    public decimal? minimumPrijs { get; set; }  // 最低价，低于此价格则流拍
    public string location { get; set; }
    public string image { get; set; }
}

public class AuctionResponse
{
    public int id { get; set; }
    public string name { get; set; }
    public int maxTime { get; set; }
    public decimal startingPrice { get; set; }
    public string status { get; set; }
    public long startTime { get; set; }
    public long endTime { get; set; }
    public string adres { get; set; }  // Veiling locatie/adres
    public List<AuctionProductResponse> products { get; set; } = new();
}

[ApiController]
[Route("api/auctions")]
public class AuctionsController : ControllerBase
{
    private readonly VeilingContext _db;

    public AuctionsController(VeilingContext db)
    {
        _db = db;
    }

    // Helper: Calculate auction status based on current time
    private string GetAuctionStatus(DateTime startTime, DateTime endTime)
    {
        var now = DateTime.UtcNow;
        
        if (now < startTime)
            return "Idle"; // Not started yet
        else if (now >= startTime && now < endTime)
            return "Active"; // Currently running
        else
            return "Finished"; // Ended
    }

    // ✅ GET: api/auctions
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AuctionResponse>>> GetAllAuctions()
    {
        var veilingen = await _db.Veilingen
            .Include(v => v.VeilingProducten)
                .ThenInclude(vp => vp.Product)
            .OrderBy(v => v.VeilingId)
            .ToListAsync();

        var responses = veilingen.Select(v => new AuctionResponse
        {
            id = v.VeilingId,
            name = v.VeilingNaam,
            maxTime = (int)(v.EindTijd - v.StartTijd).TotalSeconds,
            startingPrice = v.VeilingProducten.Any() ? v.VeilingProducten.Min(vp => vp.StartPrijs) : 0,
            status = GetAuctionStatus(v.StartTijd, v.EindTijd), // Dynamic status
            startTime = new DateTimeOffset(v.StartTijd, TimeSpan.Zero).ToUnixTimeMilliseconds(),
            endTime = new DateTimeOffset(v.EindTijd, TimeSpan.Zero).ToUnixTimeMilliseconds(),
            adres = v.Adres,
            products = v.VeilingProducten.Select(vp => new AuctionProductResponse
            {
                productId = vp.ArtikelId,
                name = vp.Product?.Soort,
                startPrice = vp.StartPrijs,
                currentPrice = vp.HuidigePrijs,
                priceReductionAmount = vp.PrijsreductieBedrag,
                priceReductionInterval = vp.PrijsreductieInterval,
                quantity = vp.Product?.Hoeveelheid,
                potmaat = vp.Product?.Potmaat,
                steellengte = vp.Product?.Steellengte,
                minimumPrijs = vp.Product?.MinimumPrijs,
                location = vp.Product?.KlokLocatie,
                image = vp.Product?.Afbeelding
            }).ToList()
        }).ToList();

        return Ok(responses);
    }

    // ✅ GET: api/auctions/products/available
    [HttpGet("products/available")]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAvailableProducts()
    {
        // Get all product IDs that are already in active auctions (materialize first)
        var usedProductIds = await _db.VeilingProducten
            .Select(vp => vp.ArtikelId)
            .Distinct()
            .ToListAsync();

        // Get all products that are not in use
        var availableProducts = await _db.Producten
            .Where(p => !usedProductIds.Contains(p.ArtikelId))
            .OrderBy(p => p.ArtikelId)
            .ToListAsync();

        var responses = availableProducts.Select(p => new ProductResponse
        {
            id = p.ArtikelId,
            soort = p.Soort,
            potmaat = p.Potmaat,
            steellengte = p.Steellengte,
            hoeveelheid = p.Hoeveelheid,
            minimumprijs = p.MinimumPrijs,
            kloklokatie = p.KlokLocatie,
            afbeelding = p.Afbeelding,
            aanvoerderId = p.AanvoerderId
        }).ToList();

        return Ok(responses);
    }

    // Debug endpoint: list veiling-producten for verification
    [HttpGet("debug/veilingproducts")]
    public async Task<ActionResult> GetVeilingProductsDebug()
    {
        var data = await _db.VeilingProducten
            .Include(vp => vp.Veiling)
            .Include(vp => vp.Product)
            .OrderBy(vp => vp.VeilingId)
            .ThenBy(vp => vp.ArtikelId)
            .Select(vp => new
            {
                veilingId = vp.VeilingId,
                productId = vp.ArtikelId,
                veilingName = vp.Veiling.VeilingNaam,
                productName = vp.Product.Soort,
                startPrice = vp.StartPrijs,
                huidigePrijs = vp.HuidigePrijs
            })
            .ToListAsync();
        return Ok(data);
    }

    // ✅ GET: api/auctions/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AuctionResponse>> GetAuction(int id)
    {
        var veiling = await _db.Veilingen
            .Include(v => v.VeilingProducten)
                .ThenInclude(vp => vp.Product)
            .Where(v => v.VeilingId == id)
            .SingleOrDefaultAsync();

        if (veiling == null)
            return NotFound($"Veiling met ID {id} niet gevonden.");

        var response = new AuctionResponse
        {
            id = veiling.VeilingId,
            name = veiling.VeilingNaam,
            maxTime = (int)(veiling.EindTijd - veiling.StartTijd).TotalSeconds,
            startingPrice = veiling.VeilingProducten.Any() ? veiling.VeilingProducten.Min(vp => vp.StartPrijs) : 0,
            status = GetAuctionStatus(veiling.StartTijd, veiling.EindTijd), // Dynamic status
            startTime = new DateTimeOffset(veiling.StartTijd, TimeSpan.Zero).ToUnixTimeMilliseconds(),
            endTime = new DateTimeOffset(veiling.EindTijd, TimeSpan.Zero).ToUnixTimeMilliseconds(),
            adres = veiling.Adres,
            products = veiling.VeilingProducten.Select(vp => new AuctionProductResponse
            {
                productId = vp.ArtikelId,
                name = vp.Product?.Soort,
                startPrice = vp.StartPrijs,
                currentPrice = vp.HuidigePrijs,
                priceReductionAmount = vp.PrijsreductieBedrag,
                priceReductionInterval = vp.PrijsreductieInterval,
                quantity = vp.Product?.Hoeveelheid,
                potmaat = vp.Product?.Potmaat,
                steellengte = vp.Product?.Steellengte,
                minimumPrijs = vp.Product?.MinimumPrijs,
                location = vp.Product?.KlokLocatie,
                image = vp.Product?.Afbeelding
            }).ToList()
        };

        return Ok(response);
    }

    // ✅ POST: api/auctions
    [HttpPost]
    public async Task<ActionResult<AuctionResponse>> AddAuction([FromBody] CreateAuctionRequest request)
    {
        // Validation
        if (request == null || string.IsNullOrEmpty(request.name))
            return BadRequest("Veilingnaam is verplicht.");

        if (request.veilingmeesterId <= 0)
            return BadRequest("Ongeldige Veilingmeester ID.");

        if (request.products == null || request.products.Count == 0)
            return BadRequest("Er moet minimaal één product worden toegevoegd aan de veiling.");

        if (request.startTime >= request.endTime)
            return BadRequest("Starttijd moet voor eindtijd liggen.");

        // Check if Veilingmeester exists
        var veilingmeester = await _db.Veilingmeesters
            .Where(v => v.VeilingmeesterId == request.veilingmeesterId)
            .SingleOrDefaultAsync();

        if (veilingmeester == null)
            return BadRequest($"Veilingmeester met ID {request.veilingmeesterId} niet gevonden.");

        // Check if all products exist and are available
        var productIds = request.products.Select(p => p.productId).ToList();
        
        // Get products that are already in use by other Veilingmeesters
        var usedProductIds = await _db.VeilingProducten
            .Include(vp => vp.Veiling)
            .Where(vp => productIds.Contains(vp.ArtikelId) && vp.Veiling.VeilingmeesterId != request.veilingmeesterId)
            .Select(vp => vp.ArtikelId)
            .Distinct()
            .ToListAsync();

        if (usedProductIds.Any())
            return BadRequest($"De volgende producten zijn al in gebruik door andere Veilingmeesters: {string.Join(", ", usedProductIds)}");

        // Check if all products exist
        var existingProducts = await _db.Producten
            .Where(p => productIds.Contains(p.ArtikelId))
            .Select(p => p.ArtikelId)
            .ToListAsync();

        var missingProducts = productIds.Except(existingProducts).ToList();
        if (missingProducts.Any())
            return BadRequest($"De volgende producten bestaan niet: {string.Join(", ", missingProducts)}");

        // Validate product prices and reduction amounts
        foreach (var product in request.products)
        {
            if (product.startPrice <= 0)
                return BadRequest($"Startprijs voor product {product.productId} moet groter dan 0 zijn.");

            if (product.priceReductionAmount < 0)
                return BadRequest($"Prijsreductie voor product {product.productId} kan niet negatief zijn.");

            if (product.priceReductionInterval <= 0)
                return BadRequest($"Prijsreductie interval voor product {product.productId} moet groter dan 0 zijn.");
        }

        // Create the auction - ensure times are stored as UTC
        var veiling = new Veiling
        {
            VeilingNaam = request.name,
            VeilingmeesterId = request.veilingmeesterId,
            Status = "Idle",
            StartTijd = request.startTime.ToUniversalTime(),
            EindTijd = request.endTime.ToUniversalTime(),
            Adres = request.adres
        };

        _db.Veilingen.Add(veiling);
        await _db.SaveChangesAsync();

        // Add products to the auction
        foreach (var productRequest in request.products)
        {
            var veilingProduct = new VeilingProduct
            {
                VeilingId = veiling.VeilingId,
                ArtikelId = productRequest.productId,
                StartPrijs = productRequest.startPrice,
                PrijsreductieBedrag = productRequest.priceReductionAmount,
                PrijsreductieInterval = productRequest.priceReductionInterval,
                HuidigePrijs = productRequest.startPrice,
                LaatsteReductieTijd = null
            };

            _db.VeilingProducten.Add(veilingProduct);
        }

        await _db.SaveChangesAsync();

        // Return the created auction with full product info
        var veilingWithProducts = await _db.Veilingen
            .Include(v => v.VeilingProducten)
                .ThenInclude(vp => vp.Product)
            .SingleAsync(v => v.VeilingId == veiling.VeilingId);

        var response = new AuctionResponse
        {
            id = veilingWithProducts.VeilingId,
            name = veilingWithProducts.VeilingNaam,
            maxTime = (int)(veilingWithProducts.EindTijd - veilingWithProducts.StartTijd).TotalSeconds,
            startingPrice = veilingWithProducts.VeilingProducten.Any() ? veilingWithProducts.VeilingProducten.Min(vp => vp.StartPrijs) : 0,
            status = GetAuctionStatus(veilingWithProducts.StartTijd, veilingWithProducts.EindTijd), // Dynamic status
            startTime = new DateTimeOffset(veilingWithProducts.StartTijd, TimeSpan.Zero).ToUnixTimeMilliseconds(),
            endTime = new DateTimeOffset(veilingWithProducts.EindTijd, TimeSpan.Zero).ToUnixTimeMilliseconds(),
            adres = veilingWithProducts.Adres,
            products = veilingWithProducts.VeilingProducten.Select(vp => new AuctionProductResponse
            {
                productId = vp.ArtikelId,
                name = vp.Product?.Soort,
                startPrice = vp.StartPrijs,
                currentPrice = vp.HuidigePrijs,
                priceReductionAmount = vp.PrijsreductieBedrag,
                priceReductionInterval = vp.PrijsreductieInterval,
                quantity = vp.Product?.Hoeveelheid,
                potmaat = vp.Product?.Potmaat,
                steellengte = vp.Product?.Steellengte,
                minimumPrijs = vp.Product?.MinimumPrijs,
                location = vp.Product?.KlokLocatie,
                image = vp.Product?.Afbeelding
            }).ToList()
        };

        return Ok(response);
    }

    // ✅ PUT: api/auctions/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateAuction(int id, string status)
    {
        var veiling = await _db.Veilingen
            .Where(v => v.VeilingId == id)
            .SingleOrDefaultAsync();

        if (veiling == null)
            return NotFound($"Veiling met ID {id} niet gevonden.");

        veiling.Status = status;
        await _db.SaveChangesAsync();

        return Ok();
    }

    // ✅ DELETE: api/auctions/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAuction(int id)
    {
        var veiling = await _db.Veilingen
            .Where(v => v.VeilingId == id)
            .SingleOrDefaultAsync();

        if (veiling == null)
            return NotFound($"Veiling met ID {id} niet gevonden.");

        // First delete related VeilingProduct records using a separate query
        var veilingProducten = await _db.VeilingProducten
            .Where(vp => vp.VeilingId == id)
            .ToListAsync();
        
        var productCount = veilingProducten.Count;
        
        if (veilingProducten.Any())
        {
            _db.VeilingProducten.RemoveRange(veilingProducten);
            await _db.SaveChangesAsync(); // Save the product deletions first
        }

        // Then delete the auction
        _db.Veilingen.Remove(veiling);
        await _db.SaveChangesAsync();

        return Ok(new { message = $"Veiling {id} en {productCount} producten verwijderd." });
    }
}