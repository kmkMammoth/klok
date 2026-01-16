/**
 * reportWebVitals - Start meting van Web Vitals prestaties in de app.
 *
 * Werking:
 * - Laadt de 'web-vitals' library dynamisch (code-splitting) alleen wanneer een geldige callback is meegegeven.
 * - Roept de verschillende metingen aan en geeft de resultaten door aan de meegegeven callback.
 *
 * Metrics:
 * - CLS (Cumulative Layout Shift): visuele stabiliteit tijdens laden.
 * - FID (First Input Delay): respons op eerste gebruikersinteractie.
 * - FCP (First Contentful Paint): tijd tot eerste content zichtbaar is.
 * - LCP (Largest Contentful Paint): tijd tot grootste zichtbare element verschijnt.
 * - TTFB (Time To First Byte): tijd tot eerste byte van de response.
 *
 * 
 *  // Log alle Web Vitals in de console
 * reportWebVitals(console.log);
 *
 * // Of stuur metrics naar een analytics endpoint
 * // reportWebVitals(metric => fetch('/analytics', { method: 'POST', body: JSON.stringify(metric) }));
 */
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamische import: laad de 'web-vitals' library alleen wanneer nodig
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Roep alle metingen aan en lever resultaten aan de callback
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
