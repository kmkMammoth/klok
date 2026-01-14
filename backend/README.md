# Veilingklok Backend

ASP.NET Core Web API voor het veilingplatform.

**Zie [ARCHITECTUUR.md](../ARCHITECTUUR.md) in de root voor volledige documentatie over:**
- Technische stack (ASP.NET Core, SQL Server, SignalR, Identity)
- Authenticatie & rollen (Koper, Aanvoerder, Veilingmeester, Admin)
- Datamodel & database
- API-endpoints & rolvereisten
- Real-time communicatie (SignalR hub)
- Veilingcyclus & productsequencing
- Concurrency-strategie (semaphores + optimistic locking)
- Setup, migraties & deployment
- Testen & testdekking

## Quick Start

```bash
cd backend/veilingklok

# Migraties uitvoeren
dotnet ef database update

# Backend starten (development)
dotnet run
```

API beschikbaar op `https://localhost:5102` (of ingestelde poort).  
Swagger UI: `https://localhost:5102/swagger/ui` (development mode).
