-- Volledige reparatie van de Veiling tabel structuur

PRINT '=== Start met opruimen van Veiling tabel ===';
PRINT '';

-- 1. Verwijder kolommen die niet zouden moeten bestaan in de Veiling tabel
IF COL_LENGTH('Veiling', 'huidigeprijs') IS NOT NULL
BEGIN
    ALTER TABLE Veiling DROP COLUMN huidigeprijs;
    PRINT '✓ huidigeprijs kolom verwijderd';
END

IF COL_LENGTH('Veiling', 'laatste_reductie_tijd') IS NOT NULL
BEGIN
    ALTER TABLE Veiling DROP COLUMN laatste_reductie_tijd;
    PRINT '✓ laatste_reductie_tijd kolom verwijderd';
END

IF COL_LENGTH('Veiling', 'prijsreductie_bedrag') IS NOT NULL
BEGIN
    ALTER TABLE Veiling DROP COLUMN prijsreductie_bedrag;
    PRINT '✓ prijsreductie_bedrag kolom verwijderd';
END

IF COL_LENGTH('Veiling', 'prijsreductie_interval') IS NOT NULL
BEGIN
    ALTER TABLE Veiling DROP COLUMN prijsreductie_interval;
    PRINT '✓ prijsreductie_interval kolom verwijderd';
END

IF COL_LENGTH('Veiling', 'startprijs') IS NOT NULL
BEGIN
    ALTER TABLE Veiling DROP COLUMN startprijs;
    PRINT '✓ startprijs kolom verwijderd';
END

IF COL_LENGTH('Veiling', 'locatie') IS NOT NULL
BEGIN
    ALTER TABLE Veiling DROP COLUMN locatie;
    PRINT '✓ locatie kolom verwijderd';
END

PRINT '';

-- 2. Repareer NULL waarden voor minimumprijs en stel in op NOT NULL
UPDATE Veiling 
SET minimumprijs = 0.00
WHERE minimumprijs IS NULL;
PRINT '✓ NULL minimumprijs waarden bijgewerkt naar 0.00';

IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Veiling' 
    AND COLUMN_NAME = 'minimumprijs' 
    AND IS_NULLABLE = 'YES'
)
BEGIN
    ALTER TABLE Veiling 
    ALTER COLUMN minimumprijs decimal(10,2) NOT NULL;
    PRINT '✓ minimumprijs kolom ingesteld op NOT NULL';
END

PRINT '';
PRINT '=== Veiling tabel opruiming voltooid ===';
PRINT '';
PRINT 'Toon nu de uiteindelijke structuur van de Veiling tabel:';
PRINT '';

-- 显示最终的列结构
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Veiling'
ORDER BY ORDINAL_POSITION;

