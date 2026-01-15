using Microsoft.AspNetCore.SignalR;

namespace veilingklok.Hubs
{
    /// <summary>
    /// SignalR Hub voor real-time veiling-events: product-updates, aankopen, vervalling.
    /// Clients joinen veiling-specifieke groepen voor scoped broadcasting.
    /// </summary>
    public class AuctionHub : Hub
    {
        /// <summary>
        /// Voeg client toe aan veiling-groep voor real-time event-notificaties.
        /// Clients ontvangen ProductStarted, ProductSold, ProductExpired events.
        /// </summary>
        public async Task JoinAuction(string auctionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(auctionId));
        }

        /// <summary>
        /// Verwijder client uit veiling-groep (bijv. bij navigatie weg van veiling).
        /// </summary>
        public async Task LeaveAuction(string auctionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGroupName(auctionId));
        }

        /// <summary>
        /// Helper: construeer consistente groepsnaam voor veiling-scoped broadcasting.
        /// </summary>
        private static string GetGroupName(string auctionId) => $"auction-{auctionId}";
    }
}
