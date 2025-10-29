import '../styles/AanvoerderKoperOverview.css';

function KoperOverview() {
  const koper = {
    naam: 'Piets plantpaleis',
    kvk: '12345678',
    adres: 'Plantstraat 1',
    email: 'Piet@plant.nl',
    iban: 'NL99 INGB 0123 4567 89'
  };

  const veiling = {
    product: 'Roze Tulpen',
    status: 'Geveild',
    veildatum: '30-10-2025',
    verkoopbedrag: '1.00',
    koper: koper.naam
  };

  return (
    <>
      <title>Productenoverzicht – Koperinformatie</title>

      <main className="koper-overview-container">
        <h1>Productenoverzicht</h1>

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
