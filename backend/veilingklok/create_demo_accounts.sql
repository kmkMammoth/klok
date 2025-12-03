-- Create Demo Accounts
-- Password: demo123 (hashed with SHA256 and Base64 encoded)

-- Demo Veilingmeester
IF NOT EXISTS (SELECT * FROM Gebruiker WHERE naam = 'demo_veilingmeester')
BEGIN
    INSERT INTO Gebruiker (naam, wachtwoord_hash)
    VALUES ('demo_veilingmeester', 'ZGVtbzEyMw=='); -- demo123 in Base64 (simple hash for demo)
    
    DECLARE @veilingmeester_id INT = SCOPE_IDENTITY();
    
    INSERT INTO Veilingmeester (gebruiker_id)
    VALUES (@veilingmeester_id);
END

-- Demo Koper
IF NOT EXISTS (SELECT * FROM Gebruiker WHERE naam = 'demo_koper')
BEGIN
    INSERT INTO Gebruiker (naam, wachtwoord_hash)
    VALUES ('demo_koper', 'ZGVtbzEyMw=='); -- demo123 in Base64
    
    DECLARE @koper_id INT = SCOPE_IDENTITY();
    
    INSERT INTO Koper (gebruiker_id, kvk_nummer, adres, email, iban_hash)
    VALUES (@koper_id, '12345678', 'Demo Straat 123, Amsterdam', 'demo_koper@example.com', 'ZGVtbzEyMw==');
END

-- Demo Aanvoerder
IF NOT EXISTS (SELECT * FROM Gebruiker WHERE naam = 'demo_aanvoerder')
BEGIN
    INSERT INTO Gebruiker (naam, wachtwoord_hash)
    VALUES ('demo_aanvoerder', 'ZGVtbzEyMw=='); -- demo123 in Base64
    
    DECLARE @aanvoerder_id INT = SCOPE_IDENTITY();
    
    INSERT INTO Aanvoerder (gebruiker_id, kvk_nummer, adres, email, iban_hash)
    VALUES (@aanvoerder_id, '87654321', 'Demo Weg 456, Rotterdam', 'demo_aanvoerder@example.com', 'ZGVtbzEyMw==');
END

SELECT 'Demo accounts created successfully!' AS Message;

