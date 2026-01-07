using Microsoft.AspNetCore.SignalR;

namespace veilingklok.Hubs
{
    public class AuctionHub : Hub
    {
        public async Task JoinAuction(string auctionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(auctionId));
        }

        public async Task LeaveAuction(string auctionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGroupName(auctionId));
        }

        private static string GetGroupName(string auctionId) => $"auction-{auctionId}";
    }
}
