namespace VeilingAPI.Models
{
    public class Auction
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int MaxTime { get; set; }
        public double StartingPrice { get; set; }
    }
}
