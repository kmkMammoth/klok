-- Verwijder alle veilingen en gerelateerde gegevens

PRINT '=== Start met verwijderen van alle veilingen ===';
PRINT '';

-- 1. Verwijder eerst alle records uit de Bod tabel (biedingen gerelateerd aan veilingen)
DELETE FROM Bod;
PRINT '✓ Alle biedingen verwijderd';

-- 2. Verwijder alle records uit de VeilingProduct tabel (veiling-product koppelingen)
DELETE FROM VeilingProduct;
PRINT '✓ Alle veiling-product koppelingen verwijderd';

-- 3. Verwijder ten slotte alle records uit de Veiling tabel
DELETE FROM Veiling;
PRINT '✓ Alle veilingen verwijderd';

PRINT '';
PRINT '=== Verwijdering voltooid ===';
PRINT '';

-- Toon resterende recordaantallen
SELECT COUNT(*) AS 'Resterende veilingen' FROM Veiling;
SELECT COUNT(*) AS 'Resterende veiling producten' FROM VeilingProduct;
SELECT COUNT(*) AS 'Resterende biedingen' FROM Bod;

