# Real-time auction behavior (summary)

What I implemented:

- `GET /api/time` — returns server UTC now: { utcNow: "2026-01-07T...Z" }
- SignalR hub at `/hubs/auction` with groups per auction (group name: `auction-{veilingId}`)
  - Client methods:
    - `JoinAuction(auctionId)` and `LeaveAuction(auctionId)` (client-invoke)
  - Server events:
    - `AuctionStarted` { auctionId, startedAtUtc }
    - `ProductStarted` { productId, auctionId, startedAtUtc, startPrice, incrementPerSecond, minimumPrice }
    - `ProductSold` { productId, buyerId, price, soldAtUtc }
    - `AuctionEnded` { auctionId }

- Backend logic (`IAuctionManager` / `AuctionManager`):
  - `StartAuctionAsync(veilingId)` — sets `Veiling.Status = Ongoing`, sets UTC start time, broadcasts `AuctionStarted` and starts first product
  - `StartNextProductAsync(veilingId)` — picks next available product and sets `Product.StartedAtUtc` and broadcasts `ProductStarted`
  - `TryBuyProductAsync(productId, buyerId)` — calculates price using server time and product fields, attempts to mark product `GEKOCHT` with `KoopPrijs` using optimistic concurrency; broadcasts `ProductSold` and triggers `StartNextProductAsync`.

Database changes required:
- `Product` table: add columns `started_at_utc` (datetime2), `koopprijs` (decimal), `row_version` (rowversion/timestamp)

Notes:
- Clients should use the `/api/time` endpoint to compute an offset and then calculate elapsed = (nowClient + offset) - product.startedAtUtc to compute current price locally for smooth UI, while authoritative events come via SignalR.
- The backend enforces single-winner semantics via concurrency and sets the sale price.

Next steps:
- Run EF Core migrations to create the new fields
- Add tests for concurrent buys
- Continue integrating the frontend UI and finalize UX (disable buy button on auction end, show sold banner, etc.)
