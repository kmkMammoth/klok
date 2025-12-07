-- Controleer en repareer kolomproblemen in de Veiling tabel

-- 1. Bekijk alle kolommen van de Veiling tabel
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Veiling'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '=== Veiling tabel kolominformatie weergegeven ===';
PRINT '';

-- 2. Update alle NULL minimumprijs waarden naar 0
UPDATE Veiling 
SET minimumprijs = 0 
WHERE minimumprijs IS NULL;

PRINT '✓ NULL minimumprijs waarden bijgewerkt naar 0';

-- 3. Stel minimumprijs in op NOT NULL
ALTER TABLE Veiling 
ALTER COLUMN minimumprijs decimal(10,2) NOT NULL;

PRINT '✓ minimumprijs kolom ingesteld op NOT NULL';
PRINT '';
PRINT '=== Reparatie voltooid ===';
PRINT 'Vertel me de werkelijke kolomnaam van de Veilingmeester foreign key op basis van de bovenstaande kolomnamen';

