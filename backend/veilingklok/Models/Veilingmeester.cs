namespace veilingklok.Models
{
    public class Veilingmeester : Gebruiker
    {
        public List<Veiling> Veilingen { get; set; } = new();
    }
}
