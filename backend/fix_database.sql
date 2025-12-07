-- Volledig database reparatie script
-- 1. Verwijder VeilingProduct tabel (als deze bestaat)
IF OBJECT_ID('VeilingProduct', 'U') IS NOT NULL
BEGIN
    DROP TABLE VeilingProduct;
    PRINT '✓ VeilingProduct tabel verwijderd';
END

-- 2. Verwijder kolommen die niet zouden moeten bestaan uit de Veiling tabel
IF COL_LENGTH('Veiling', 'huidige_prijs') IS NOT NULL
BEGIN
    ALTER TABLE Veiling DROP COLUMN huidige_prijs;
    PRINT '✓ huidige_prijs kolom verwijderd uit Veiling tabel';
END

IF COL_LENGTH('Veiling', 'vermindering_per_seconde') IS NOT NULL
BEGIN
    ALTER TABLE Veiling DROP COLUMN vermindering_per_seconde;
    PRINT '✓ vermindering_per_seconde kolom verwijderd uit Veiling tabel';
END

-- 3. 创建 VeilingProduct 表
CREATE TABLE VeilingProduct (
    veiling_product_id int NOT NULL IDENTITY(1,1),
    veiling_id int NOT NULL,
    artikel_id int NOT NULL,
    startprijs decimal(10,2) NOT NULL,
    prijsreductie_bedrag decimal(10,2) NOT NULL,
    prijsreductie_interval int NOT NULL,
    huidige_prijs decimal(10,2) NOT NULL DEFAULT 0,
    laatste_reductie_tijd datetime2 NULL,
    CONSTRAINT PK_VeilingProduct PRIMARY KEY (veiling_product_id),
    CONSTRAINT FK_VeilingProduct_Veiling_veiling_id FOREIGN KEY (veiling_id) 
        REFERENCES Veiling(veiling_id) ON DELETE NO ACTION,
    CONSTRAINT FK_VeilingProduct_Product_artikel_id FOREIGN KEY (artikel_id) 
        REFERENCES Product(artikel_id) ON DELETE NO ACTION
);

CREATE INDEX IX_VeilingProduct_veiling_id ON VeilingProduct(veiling_id);
CREATE INDEX IX_VeilingProduct_artikel_id ON VeilingProduct(artikel_id);

PRINT '✓ VeilingProduct tabel succesvol aangemaakt';

-- 4. Update migratie geschiedenis
IF NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId='20251206212637_AddVeilingProductTable')
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) 
    VALUES ('20251206212637_AddVeilingProductTable','9.0.9');

IF NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId='20251206214823_MakeHuidigePrijsRequired')
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) 
    VALUES ('20251206214823_MakeHuidigePrijsRequired','9.0.9');

PRINT '✓ Migratie geschiedenis bijgewerkt';
PRINT '';
PRINT '=== Database reparatie voltooid ===';
PRINT 'Herstart de backend server';

