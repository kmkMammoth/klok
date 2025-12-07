-- Create VeilingProduct table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VeilingProduct]') AND type in (N'U'))
BEGIN
    CREATE TABLE [VeilingProduct] (
        [veiling_product_id] int NOT NULL IDENTITY(1,1),
        [veiling_id] int NOT NULL,
        [artikel_id] int NOT NULL,
        [startprijs] decimal(10,2) NOT NULL,
        [prijsreductie_bedrag] decimal(10,2) NOT NULL,
        [prijsreductie_interval] int NOT NULL,
        [huidige_prijs] decimal(10,2) NULL,
        [laatste_reductie_tijd] datetime2 NULL,
        CONSTRAINT [PK_VeilingProduct] PRIMARY KEY ([veiling_product_id]),
        CONSTRAINT [FK_VeilingProduct_Product_artikel_id] FOREIGN KEY ([artikel_id]) REFERENCES [Product] ([artikel_id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_VeilingProduct_Veiling_veiling_id] FOREIGN KEY ([veiling_id]) REFERENCES [Veiling] ([veiling_id]) ON DELETE NO ACTION
    );

    CREATE INDEX [IX_VeilingProduct_artikel_id] ON [VeilingProduct] ([artikel_id]);
    CREATE INDEX [IX_VeilingProduct_veiling_id] ON [VeilingProduct] ([veiling_id]);
END;

-- Add migration history entry if it doesn't exist
IF NOT EXISTS (SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20251206212637_AddVeilingProductTable')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20251206212637_AddVeilingProductTable', N'9.0.9');
END;

