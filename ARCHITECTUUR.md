# Veilingklok – Architectuurdocument

**Versie**: 1.0  
**Datum**: januari 2026  
**Project**: Veilingklok (veiling/auctionplatform)

---

## 1. Overzicht & Technische Stack

Veilingklok is een real-time veilingplatform waarmee veilingmeesters producten kunnen aanbieden, aanvoerders producten kunnen inbrengen, en kopers producten kunnen kopen. Het systeem ondersteunt:
- **Live prijsdaling** met server-authoriteit
- **Real-time notificaties** via SignalR
- **Rolgebaseerde toegang** (Koper, Aanvoerder, Veilingmeester, Admin)
- **Concurrentiebeheer** bij gelijktijdige aankopen

### Technische Stack

| Onderdeel | Technologie |
|-----------|-------------|
| **Backend API** | ASP.NET Core 8+ Web API |
| **Database** | SQL Server (Entity Framework Core) |
| **Authenticatie** | ASP.NET Identity + Bearer tokens |
| **Real-time** | SignalR (WebSocket/polling fallback) |
| **Frontend** | React (Create React App) |
| **API-communicatie** | REST + SignalR |

---

## 2. Authenticatie & Rollen

### Authenticatie-flow

1. **Registratie/Login**: Gebruiker registreert zich via Identity API-endpoint (`/identity`).
2. **Token-uitgifte**: Na succesvolle login ontvangt de gebruiker een Bearer-token (geldigheidsduur: 60 minuten).
3. **API-requests**: Alle beschermde endpoints vereisen de Bearer-token in de `Authorization`-header.
4. **Token-vervaling**: Tokens vervallen na 60 minuten; nieuwe login is nodig.

### Rollen & Permissies

Vier rollen worden gedefinieerd en ge-seed in `Program.cs`:

| Rol | Beschrijving | Primaire acties |
|-----|-------------|-----------------|
| **Koper** | Koper van producten | Kan bieden op producten, ziet beschikbare veilingen |
| **Aanvoerder** | Brengt producten in | Kan producten maken, verwijderen |
| **Veilingmeester** | Beheert veilingen | Kan veilingen starten/stoppen, producten binnen veiling beheren, veilingen verwijderen |
| **Admin** | Systeembeheerder | Volledige toegang; seed-administratorgebruiker op startup |

### CORS & Ontwikkeling

- **CORS-beleid**: Alleen `http://localhost:3000` is toegestaan (development).
- **Swagger UI**: Beschikbaar in development mode op `/swagger/ui`.
- **Dummy Email Sender**: Geïmplementeerd (geen echte e-mails verzonden).

### Seed-gegevens (startup)

Bij eerste start worden in `Program.cs` de volgende gegevens aangemaakt:
- **Rollen**: Koper, Aanvoerder, Veilingmeester, Admin
- **Admin-gebruiker**: 
  - Gebruikersnaam: `adminUser`
  - E-mailadres: (niet ingesteld)
  - Wachtwoord: `Test123!` (hardcoded – vervang in productie!)

---

## 3. Datamodel & Entiteiten

### Kernentiteiten

#### **Gebruiker** (`Gebruiker`)
Base Identity-gebruiker met rol-assignments.
- `Id`: Unieke identifier (GUID)
- `UserName`: Login-naam
- `EmailConfirmed`: E-mail geverifieerd?

#### **Veiling** (Auction)
Representeert een veiling-sessie met tijd en status.
- `VeilingId`: Primaire sleutel
- `Gebruiker_id`: FK naar Veilingmeester (creator)
- `VeilingNaam`: Displaynaam
- `StartTijd`, `EindTijd`: Veiling-looptijd (UTC)
- `Status`: `Idle` (wacht) → `Ongoing` (actief) → `Done` (beëindigd)
- `MinimumPrijs`: Minimale startprijs voor producten

#### **Product** (Artikel)
Fysiek goederen aangeboden in een veiling.
- `ArtikelId`: Primaire sleutel
- `Gebruiker_id`: FK naar Aanvoerder (inbrenger)
- `Soort`, `Potmaat`, `Steellengte`, etc.: Productkenmerken
- `Hoeveelheid`: Aantal stuks beschikbaar
- `MinimumPrijs`: Minimale biedprijs
- `Status`: `BESCHIKBAAR` → `RUNNING` → `GEKOCHT` / `VERWORPEN`
- **Veiling-velden**:
  - `VeilingId`: FK naar Veiling (indien toegewezen)
  - `StartPrijs`: Startbiedprijs in veiling
  - `IncrementPerSecond`: Prijsdaling per seconde
  - `StartedAtUtc`: Moment waarop product in veiling gestart is
  - `KoopPrijs`: Eindbiedprijs (ingesteld bij koop)
- `RowVersion`: Timestamp voor optimistic concurrency

#### **GekochtProduct** (Purchased)
Registreert succesvolle aankopen met hoeveelheid en prijs.
- `Id`: Primaire sleutel
- `ProductId`: FK naar Product
- `GebruikerId`: FK naar Koper
- `Hoeveelheid`: Aantal gekocht
- `KoopPrijs`: Betaalde prijs (totaal)
- `KoopDatum`: Aankoop-timestamp

#### **Koper** (Buyer)
Rol-specifieke gegevens voor kopers.

#### **Aanvoerder** (Supplier)
Rol-specifieke gegevens voor aanvoerders.

#### **Veilingmeester** (Auctioneer)
Rol-specifieke gegevens voor veilingmeesters.

---

## 4. API-endpoints & Rolvereisten

### Veilingen (`/api/auctions`)

| Methode | Endpoint | Rollen | Beschrijving |
|---------|----------|--------|-------------|
| `GET` | `/api/auctions` | Alle | Haal alle veilingen op |
| `GET` | `/api/auctions/{id}` | Alle | Haal specifieke veiling op |
| `POST` | `/api/auctions` | Veilingmeester, Admin | Maak nieuwe veiling |
| `PUT` | `/api/auctions/{id}` | Veilingmeester, Admin | Update veiling-status (o.a. start → `Ongoing`) |
| `DELETE` | `/api/auctions/{id}` | Veilingmeester, Admin | Verwijder veiling (reset producten) |

### Producten (`/api/products`)

| Methode | Endpoint | Rollen | Beschrijving |
|---------|----------|--------|-------------|
| `GET` | `/api/products` | Alle | Haal alle producten op (optioneel gefilterd op `veilingId`) |
| `GET` | `/api/products/{id}` | Alle | Details van één product |
| `GET` | `/api/products/{id}/status` | Alle | Alleen status van product |
| `POST` | `/api/products` | Admin, Aanvoerder | Maak nieuw product (creator = Aanvoerder) |
| `PUT` | `/api/products/{id}` | Admin, Aanvoerder | Update productgegevens |
| `PUT` | `/api/products/{id}/assign-veiling` | Admin, Veilingmeester | Wijs product toe aan veiling |
| `PUT` | `/api/products/{id}/assign-koper` | Admin, Veilingmeester | Wijs product toe aan koper (deprecated?) |
| `PUT` | `/api/products/{id}/buy` | Alle | Koop product (zie lifecycle) |
| `DELETE` | `/api/products/{id}` | Admin, Aanvoerder | Verwijder onverkocht product |

### Gebruikers (`/api/users` en Identity)

| Methode | Endpoint | Rollen | Beschrijving |
|---------|----------|--------|-------------|
| `GET` | `/api/users/{id}` | Alle | Gebruikersdetails |
| `POST` | `/identity/register` | Openbaar | Registreer nieuwe gebruiker |
| `POST` | `/identity/login` | Openbaar | Login (ontvang Bearer-token) |
| `POST` | `/api/users/{id}/roles` | Admin | Wijs rol toe aan gebruiker |

### Koper (`/api/koper`)

| Methode | Endpoint | Rollen | Beschrijving |
|---------|----------|--------|-------------|
| `POST` | `/api/koper/register` | Openbaar | Registreer nieuwe koper met KVK, adres en IBAN |

### Aanvoerder (`/api/aanvoerder`)

| Methode | Endpoint | Rollen | Beschrijving |
|---------|----------|--------|-------------|
| `POST` | `/api/aanvoerder/register` | Openbaar | Registreer nieuwe aanvoerder met KVK, adres en IBAN |

### Veilingmeester (`/api/veilingmeester`)

| Methode | Endpoint | Rollen | Beschrijving |
|---------|----------|--------|-------------|
| `POST` | `/api/veilingmeester/register` | Openbaar | Registreer nieuwe veilingmeester |

### Gekochte Producten (`/api/gekochtproduct`)

| Methode | Endpoint | Rollen | Beschrijving |
|---------|----------|--------|-------------|
| `GET` | `/api/gekochtproduct` | Alle (auth) | Haal alle gekochte producten op |
| `GET` | `/api/gekochtproduct/{id}` | Alle (auth) | Details van één gekocht product |
| `GET` | `/api/gekochtproduct/product/{productId}` | Alle (auth) | Gekocht product op basis van product-ID |
| `GET` | `/api/gekochtproduct/history-all-sorted` | Alle (auth) | Volledige aankoophistorie gesorteerd op datum (met JOIN) |
| `POST` | `/api/gekochtproduct` | Alle (auth) | Maak gekocht product aan (via AuctionManager) |
| `DELETE` | `/api/gekochtproduct/{id}` | Admin | Verwijder gekocht product |

### Overige

| Methode | Endpoint | Rollen | Beschrijving |
|---------|----------|--------|-------------|
| `GET` | `/api/time` | Openbaar | Server-tijd (UTC) voor client-synchronisatie |

---

## 5. Real-time Communicatie (SignalR)

### Hub: `/hubs/auction`

SignalR-hub voor live updates tijdens veilingen.

#### Client-methoden (client → server)

```csharp
await connection.InvokeAsync("JoinAuction", auctionId);
await connection.InvokeAsync("LeaveAuction", auctionId);
```

#### Server-events (server → client)

| Event | Payload | Beschrijving |
|-------|---------|-------------|
| `AuctionStarted` | `{ auctionId, startedAtUtc }` | Veiling gestart |
| `ProductStarted` | `{ productId, auctionId, startedAtUtc, startPrice, incrementPerSecond, minimumPrice }` | Product begint in veiling |
| `ProductSold` | `{ productId, buyerId, price, soldAtUtc }` | Product volledig verkocht (alle hoeveelheid verkocht) |
| `ProductUpdated` | `{ productId, remaining }` | Hoeveelheid bijgewerkt (deelverkoop: product blijft `RUNNING`) |
| `ProductExpired` | `{ productId, expiredAtUtc }` | Product verlopen (prijsminimum bereikt, status → `VERWORPEN`) |
| `AuctionEnded` | `{ auctionId }` | Veiling beëindigd (geen producten meer) |

### Groepen

Clients joinen een groep `auction-{veilingId}` per veiling. Events worden naar groepen broadcast.

### Prijsbeheer & Synchronisatie

**Server-authoriteit**:
- Prijzen worden **altijd** berekend op de server.
- Formule: `prijs = startPrijs - (huidig_moment - startMoment) * incrementPerSecond`
- Prijs kan niet lager dan `minimumPrijs` gaan.

**Client-synchronisatie**:
- Client haalt server-tijd op via `GET /api/time`.
- Client berekent lokale offset: `offset = serverTime - clientTime`.
- Client berekent huidige tijd: `lokaleHuidigeTime = Date.now() + offset`.
- Clients tonen **geschatte** prijs lokaal voor smooth UI.
- Server zendt `ProductSold` event met **authoriteit** prijs.

---

## 6. Auction Lifecycle (Veilingcyclus)

### Statussen & Transities

```
Veiling "Idle" → "Ongoing" → "Done"
Product "BESCHIKBAAR" → "RUNNING" → "GEKOCHT" / "VERWORPEN"
```

### Gedetailleerde Flow

#### 1. **Voorbereiding**
- **Aanvoerder** maakt producten aan (`POST /api/products`).
  - Status: `BESCHIKBAAR`
  - Geen veiling-informatie nog.
- **Veilingmeester** maakt veiling aan (`POST /api/auctions`) met naam, duur en minimale prijs.
  - Status: `Idle`
  - StartTijd/EindTijd: Ingesteld op huiding UTC (kan worden overschreven)
- **Veilingmeester** wijst producten toe aan veiling (`PUT /api/products/{id}/assign-veiling`).
  - Stelt `VeilingId`, `StartPrijs`, `IncrementPerSecond` in.
  - Product blijft `BESCHIKBAAR` tot veiling start.

#### 2. **Veilingstart**
- **Veilingmeester** start veiling: `PUT /api/auctions/{id}` met `status=Ongoing`.
- Backend (`AuctionManager.StartAuctionAsync`):
  - Stelt veiling.Status = `Ongoing`.
  - Zet veiling-tijden op **nu** (UTC).
  - Broadcast `AuctionStarted` event naar groep.
  - Start automatisch het eerste product.

#### 3. **Productsequencing**
- `StartNextProductAsync` selecteert eerste onverkochte product zonder `StartedAtUtc`:
  - Stelt `product.StartedAtUtc = nu (UTC)`.
  - Stelt `product.Status = RUNNING`.
  - Broadcast `ProductStarted` event.
  - Plant automatische vervalling (zie onder).

#### 4. **Aankoop (Buy)**
- **Koper** roept `PUT /api/products/{id}/buy` aan met optioneel `hoeveelheid` (standaard 1).
- **Of** via `POST /api/gekochtproduct` met `productId`, `hoeveelheid` en `koopPrijs`.
- Backend (`AuctionManager.TryBuyProductAsync`):
  - **Semaphore-lock** (per product, in-memory ConcurrentDictionary) voor gelijktijdigheid.
  - Haalt huidige server-tijd op (UTC).
  - Berekent huidige prijs: `prijs = startPrijs - (nu - startedAtUtc) * increment`.
  - Controleert:
    - Product is `RUNNING`.
    - Veiling is `Ongoing` en niet verlopen.
    - Hoeveelheid beschikbaar.
    - Gevraagde hoeveelheid ≤ beschikbare hoeveelheid.
    - Prijs ≥ minimumPrijs.
  - **Deelverkoopondersteuning**: 
    - Maakt `GekochtProduct`-record aan met gekochte hoeveelheid.
    - Decrementeert product `Hoeveelheid` met gekochte hoeveelheid.
  - **Indien volledig verkocht** (hoeveelheid = 0):
    - Stelt `product.Status = GEKOCHT`, `product.gebruiker_id = buyerId`, `product.KoopPrijs = berekende_prijs`.
    - Broadcast `ProductSold` met finale prijs.
    - **Async trigger** `StartNextProductAsync` (geen blokkade).
  - **Indien partieel verkocht** (hoeveelheid > 0):
    - Broadcast `ProductUpdated` met resterende hoeveelheid.
    - Product blijft `RUNNING` en kan verder verkocht worden.
  - **Concurrency-controle**: Optimistic concurrency via `RowVersion`.

#### 5. **Automatische Vervalling**
- Na `ProductStarted` plant backend automatische vervalling:
  - Berekent tijd tot minimumprijs: `secondsUntilMin = (startPrijs - minimumPrijs) / increment`.
  - Plant taak voor `secondsUntilMin * 1000` ms.
- Na verloop:
  - Controleert product is nog `RUNNING` en niet verkocht.
  - Stelt `product.Status = VERWORPEN`.
  - Broadcast `ProductExpired`.
  - Trigger `StartNextProductAsync`.

#### 6. **Veilingeinde**
- Geen onverkochte producten meer.
- `StartNextProductAsync` vindt `null`:
  - Stelt `veiling.Status = Done`.
  - Broadcast `AuctionEnded`.

---

## 7. Frontend-integratie & Paginastructuur

### Verificatie & Autorisatie

- **RoleContext**: Globale state voor huidige gebruiker, rollen en auth-status.
- **RequireRole**: HOC-wrapper die pagina's beschermt op basis van rol.
- **JWT-token opslag**: Doorgaans in sessionStorage (voorkeur) of localStorage.
- **API-verzoeken**: Token wordt meegezonden in `Authorization: Bearer <token>`-header.

### SignalR-integratie

- **Verbindingsopbouw**: Frontend maakt verbinding met `/hubs/auction` en joint groepen (`JoinAuction(auctionId)`).
- **Event-luisteren**: Pages luisteren naar events zoals `ProductStarted`, `ProductSold`, `AuctionEnded`.
- **Prijsweergave**: Frontend berekent lokale prijs met offset-gecorrigeerde servertijd.
- **Real-time feedback**: UI-updates op events; geen handmatige polling nodig.

### Voorbeeldpagina's

De frontend bevat de volgende pagina's:

- **Login** (`Login.js`): Openbare pagina voor inloggen.
- **Register** (`Register.js`): Openbare pagina voor registreren.
- **KoperDashboard** (`KoperDashboard.js`): Dashboard voor kopers; toont actieve veilingen en producten, kan bieden.
- **AanvoerderCreateProduct** (`AanvoerderCreateProduct.js`): Formulier voor aanvoerders om nieuwe producten in te brengen.
- **AanvoerderKoperOverview** (`AanvoerderKoperOverview.js`): Overzicht van kopers voor aanvoerders.
- **VeilingmeesterCreateAuction** (`VeilingmeesterCreateAuction.js`): Formulier voor veilingmeesters om nieuwe veilingen aan te maken.
- **ActorAccount** (`ActorAccount.js`): Account-overzicht voor gebruikers (profiel/instellingen).

Alle beschermde pagina's gebruiken `RequireRole` HOC voor autorisatie.

---

## 8. Lokale Setup & Migraties

### Vereisten

- **.NET 8+** (ASP.NET Core runtime)
- **SQL Server 2019+** (LocalDB of standaard instance)
- **Node.js 18+** en npm (voor frontend)
- **Git**

### Backend-setup

#### 1. Configuratie
- Bewerk `backend/veilingklok/appsettings.Development.json`:
  ```json
  {
    "ConnectionStrings": {
      "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=veilingklok;Integrated Security=true;"
    }
  }
  ```

#### 2. Migraties
```bash
cd backend/veilingklok
dotnet ef database update
```
- Maakt database aan en voert alle migraties uit.
- Seed-gegevens (rollen + admin) worden via `Program.cs` aangemaakt.

#### 3. Backend starten
```bash
dotnet run
```
- API beschikbaar op `https://localhost:5102` (of ingestelde poort).
- Swagger UI op `https://localhost:5102/swagger/ui` (development).

### Frontend-setup

#### 1. Installatie
```bash
cd frontend
npm install
```

#### 2. Configuratie (indien nodig)
- Controleer API-URL in omgevingsvariabelen of configuratie.
- Development: API op `https://localhost:5102`.

#### 3. Frontend starten
```bash
npm start
```
- App beschikbaar op `http://localhost:3000`.
- Hot-reload ingeschakeld.

### Docker (optioneel)

`docker-compose.yml` kan gebruikt worden voor containerisatie (ontwikkeling/productie).

---

## 9. Operations, Configuratie & Deployment

### Omgevingsvariabelen & Configuratie

#### Development (`appsettings.Development.json`)
- **Swagger**: Ingeschakeld
- **CORS**: `http://localhost:3000`
- **Database**: LocalDB of test-instance
- **Email-verzending**: Dummy (geen echo)
- **Logging**: Debug-niveau

#### Production (`appsettings.json`)
- **Swagger**: Uitgeschakeld
- **CORS**: Aanpassen naar productie-frontend-URL
- **Database**: Productie-instance
- **Email**: Real email provider (SmtpSettings)
- **JWT-secret**: Sterke sleutel (bewerk `Program.cs`)
- **Logging**: Info-niveau of hoger
- **HTTPS**: Verplicht

### Migratie & Database-updates

```bash
# Migraties weergeven
dotnet ef migrations list

# Nieuwe migratie aanmaken
dotnet ef migrations add <MigrationName>

# Database bijwerken
dotnet ef database update [specific migration]

# Rollback (vorige migratie)
dotnet ef database update <PreviousMigrationName>
```

### Admin-seed & Credentials

- **Default admin**:
  - Gebruiker: `adminUser`
  - Wachtwoord: `Test123!` (hardcoded in `Program.cs`)
- **Aanpassen**: Pas `Program.cs` aan voordat je in productie gaat en maak een sterker wachtwoord.

### Deployment-stappen (samenvatting)

1. **Backend**:
   - Zet CORS, database-connection en secrets in productie-instellingen.
   - Build: `dotnet publish -c Release`.
   - Deploy naar server (bijv. Azure App Service, IIS, Docker).
   - Voer `dotnet ef database update` uit op productie-omgeving.

2. **Frontend**:
   - Build: `npm run build`.
   - Deploy build-folder naar statische webhost (bijv. Azure Static Web Apps, S3, GitHub Pages).
   - Zet frontend-URL in backend CORS-config.

---

## 10. Testen & Testdekking*
*(Meer over tests in ons testplan)

### Testcategorieën

| Testbestand | Onderwerp | Dekking |
|-------------|-----------|--------|
| `AuctionManagerTest.cs` | `IAuctionManager` | Start auction, product sequencing, buy logic |
| `AuctionExpiryTest.cs` | Auto-expiry | Vervalschema, status-overgang |
| `ProductControllerTests.cs` | Product CRUD, assign, buy | Endpoint-autorisatie, validatie |
| `VeilingControllerTests.cs` | Veiling CRUD, start | Statustransities, product-reset op delete |
| `UserManagementTest.cs` | Rol-toewijzing | Role seeding, gebruikersauthenticatie |
| `ProductTest.cs` | Product-entity | Modelconstraints |
| `KoperTest.cs` | Koper-entity | |
| `VeilingTest.cs` | Veiling-entity | |

### Tests uitvoeren

```bash
cd backend/unittests
dotnet test
```

### Testdekking-focus

- **Kritieke paden**: Veiling-start, product-sequencing, aankoop (incl. concurrency).
- **Foutafhandeling**: Ongeldige rollen, verlopen veilingen, onvoldoende hoeveelheid.
- **Concurrency**: Gelijktijdige aankopen op hetzelfde product.
- **Autorisatie**: Rol-controles op alle beschermde endpoints.

---

## 11. Bekend Gedrag & Aantekeningen

### Opmerkingen voor Ontwikkelaars

1. **Concurrency in TryBuyProductAsync**:
   - Semaphore per product (in-memory ConcurrentDictionary) voor synchrone toegang.
   - Optimistic concurrency via `RowVersion` voor database-conflictdetectie.
   - Maakt `GekochtProduct` aan **voor** productstatusupdate (transactionele semantiek).

2. **Prijsberekening**:
   - Server berekent altijd finale prijs; clients gebruiken `/api/time` voor lokale schatting.
   - Prijs kan niet negatief worden (floor bij `minimumPrijs`).
   - Prijs wordt gevalideerd tegen minimumPrijs voordat aankoop wordt toegestaan.

3. **Veilingduration**:
   - Ingesteld bij veiling-creatie; duur wordt herinitialiseerd op start (`StartAuctionAsync`).

4. **Productvervalling**:
   - Automatisch gepland na `ProductStarted`.
   - Berekent tijd tot minimumPrijs: `(startPrijs - minimumPrijs) / increment`.
   - Non-blocking async taak (via `Task.Delay` met nieuwe scope).
   - Controleert status voordat product als `VERWORPEN` wordt gemarkeerd.

5. **Delete Veiling**:
   - Verwijdert enkel veiling-toewijzing van producten.
   - Zet onverkochte producten terug naar `BESCHIKBAAR`.
   - Verwijdert reeds verkochte producten (`GEKOCHT`) niet.

6. **Email-verzending**:
   - `DummyEmailSender` geïmplementeerd; geen echte e-mails.

7. **RowVersion (Optimistic Concurrency)**:
   - SQL Server `timestamp`/`rowversion` wordt automatisch bijgewerkt op schrijven.
   - Clients hoeven niet `RowVersion` in te stellen; database handelt het af.

8. **Deelverkoop (Partial Sales)**:
   - Producten ondersteunen deelverkoop: koper kan specifieke hoeveelheid kopen.
   - Meerdere `GekochtProduct`-records kunnen verwijzen naar hetzelfde product.
   - Product blijft `RUNNING` tot alle hoeveelheid verkocht is.
   - `ProductUpdated` event houdt clients op de hoogte van resterende voorraad.

9. **Aankoophistorie**:
   - `/api/gekochtproduct/history-all-sorted` gebruikt raw SQL met JOIN voor performance.
   - Retourneert volledige historie met product-soort, gesorteerd op aankoopdatum.

10. **Rol-specifieke registratie**:
    - Aparte endpoints voor Koper, Aanvoerder en Veilingmeester registratie.
    - Koper en Aanvoerder vereisen KVK-nummer, adres, email en IBAN.
    - Veilingmeester registratie is eenvoudiger (alleen username/password).
    - Alle registraties zetten automatisch de juiste rol via UserManager.

---

## 12. Toekomstige Verbeteringen

- Real email-integratie.
- Uitgebreid logging & monitoring (Application Insights, ELK).
- Frontend-unit tests (Jest, React Testing Library).
- Geavanceerde query-optimalisaties (pagination, indexering).
- Admin-dashboard voor gebruikersmanagement.

---

## 13. Contact & Versiebeheer

**Auteurs**: Mike van den Berg, Noach Ambachtsheer, Jiri Redeker  
**Versiebeheer**: Git (main branch)  
**Bijdragen**: Volg PR-proces; test lokaal voordat push.

