-- Geforceerde opruiming van alle afhankelijkheden en foutieve kolommen in de Veiling tabel

PRINT '=== Start met geforceerde opruiming van Veiling tabel ===';
PRINT '';

-- 1. Verwijder alle default constraints gerelateerd aan foutieve kolommen
DECLARE @sql NVARCHAR(MAX);
DECLARE @constraintName NVARCHAR(256);

-- Verwijder constraint voor huidigeprijs
SELECT @constraintName = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_column_id = c.column_id
WHERE dc.parent_object_id = OBJECT_ID('Veiling')
AND c.name = 'huidigeprijs';

IF @constraintName IS NOT NULL
BEGIN
    SET @sql = 'ALTER TABLE Veiling DROP CONSTRAINT ' + @constraintName;
    EXEC sp_executesql @sql;
    PRINT '✓ Constraint voor huidigeprijs verwijderd: ' + @constraintName;
END

-- Verwijder constraint voor startprijs
SET @constraintName = NULL;
SELECT @constraintName = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_column_id = c.column_id
WHERE dc.parent_object_id = OBJECT_ID('Veiling')
AND c.name = 'startprijs';

IF @constraintName IS NOT NULL
BEGIN
    SET @sql = 'ALTER TABLE Veiling DROP CONSTRAINT ' + @constraintName;
    EXEC sp_executesql @sql;
    PRINT '✓ Constraint voor startprijs verwijderd: ' + @constraintName;
END

-- Verwijder constraint voor prijsreductie_bedrag
SET @constraintName = NULL;
SELECT @constraintName = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_column_id = c.column_id
WHERE dc.parent_object_id = OBJECT_ID('Veiling')
AND c.name = 'prijsreductie_bedrag';

IF @constraintName IS NOT NULL
BEGIN
    SET @sql = 'ALTER TABLE Veiling DROP CONSTRAINT ' + @constraintName;
    EXEC sp_executesql @sql;
    PRINT '✓ Constraint voor prijsreductie_bedrag verwijderd: ' + @constraintName;
END

-- Verwijder constraint voor prijsreductie_interval
SET @constraintName = NULL;
SELECT @constraintName = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_column_id = c.column_id
WHERE dc.parent_object_id = OBJECT_ID('Veiling')
AND c.name = 'prijsreductie_interval';

IF @constraintName IS NOT NULL
BEGIN
    SET @sql = 'ALTER TABLE Veiling DROP CONSTRAINT ' + @constraintName;
    EXEC sp_executesql @sql;
    PRINT '✓ Constraint voor prijsreductie_interval verwijderd: ' + @constraintName;
END

-- Verwijder constraint voor locatie
SET @constraintName = NULL;
SELECT @constraintName = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_column_id = c.column_id
WHERE dc.parent_object_id = OBJECT_ID('Veiling')
AND c.name = 'locatie';

IF @constraintName IS NOT NULL
BEGIN
    SET @sql = 'ALTER TABLE Veiling DROP CONSTRAINT ' + @constraintName;
    EXEC sp_executesql @sql;
    PRINT '✓ Constraint voor locatie verwijderd: ' + @constraintName;
END

PRINT '';

-- 2. Verwijder nu de kolommen
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

-- 3. Repareer minimumprijs
UPDATE Veiling 
SET minimumprijs = 0.00
WHERE minimumprijs IS NULL;
PRINT '✓ NULL minimumprijs waarden bijgewerkt naar 0.00';

ALTER TABLE Veiling 
ALTER COLUMN minimumprijs decimal(10,2) NOT NULL;
PRINT '✓ minimumprijs kolom ingesteld op NOT NULL';

PRINT '';
PRINT '=== Veiling tabel opruiming voltooid ===';
PRINT '';
PRINT 'Uiteindelijke structuur:';

SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Veiling'
ORDER BY ORDINAL_POSITION;

