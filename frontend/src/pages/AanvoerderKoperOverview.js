import '../styles/AanvoerderKoperOverview.css';

/**
 * KoperOverview
 * Toont een beknopt klantenoverzicht voor de aanvoerder met
 * basisinformatie over de laatste veilingtransactie en kopergegevens.
 *
 * Huidige implementatie gebruikt statische mockdata ter illustratie.
 * In productie kan dit vervangen worden door data uit de backend (fetch/Query).
 */
function KoperOverview() {
  // Mock kopergegevens; vervang door API-response indien beschikbaar.
  const koper = {
    naam: 'Piets plantpaleis',
    kvk: '12345678',
    adres: 'Plantstraat 1',
    email: 'Piet@plant.nl',
    iban: 'NL99 INGB 0123 4567 89'
  };

  // Mock veilinginformatie; bevat samenvatting van laatste verkoop.
  const veiling = {
    product: 'Roze Tulpen',
    status: 'Geveild',
    veildatum: '30-10-2025',
    verkoopbedrag: '1.00',
    koper: koper.naam
  };

  return (
    <>
      <main className="koper-overview-container">
        <h1>Klantenoverzicht</h1>

        {/* Sectie: product-/veilinginformatie in readOnly inputs voor snelle scan */}
        <section aria-labelledby="product-info-heading" className="product-info">
          <div className="info-row-single">
            <label htmlFor="product">Product:</label>
            <input id="product" type="text" value={veiling.product} readOnly />

            <label htmlFor="status">Status:</label>
            <input id="status" type="text" value={veiling.status} readOnly />

            <label htmlFor="veildatum">Veildatum:</label>
            <input id="veildatum" type="text" value={veiling.veildatum} readOnly />

            <label htmlFor="verkoopbedrag">Verkoopbedrag:</label>
            <input id="verkoopbedrag" type="text" value={veiling.verkoopbedrag} readOnly />

            <label htmlFor="koper">Koper:</label>
            <input id="koper" type="text" value={veiling.koper} readOnly />
          </div>
        </section>

        {/* Sectie: koperprofiel met basis contact-/facturatiegegevens */}
        <section aria-labelledby="koper-info-heading" className="koper-info">
          <h2 id="koper-info-heading">Koperinformatie:</h2>

          <div className="koper-box">
            <p><strong>Naam:</strong> {koper.naam}</p>
            <p><strong>Kvk:</strong> {koper.kvk}</p>
            <p><strong>Adres:</strong> {koper.adres}</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href={`mailto:${koper.email}`}>
                {koper.email}
              </a>
            </p>
            <p><strong>Iban:</strong> {koper.iban}</p>
          </div>
        </section>
      </main>
    </>
  );
}

export default KoperOverview;
