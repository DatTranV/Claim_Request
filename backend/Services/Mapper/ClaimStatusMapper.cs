using BusinessObjects;

namespace Services.Mapper
{
    public static class ClaimStatusMapper
    {
        private static readonly Dictionary<string, ClaimStatus> _statusMap = new Dictionary<string, ClaimStatus>(StringComparer.OrdinalIgnoreCase)
    {
        { "draft", ClaimStatus.Draft },
        { "pending-approval", ClaimStatus.PendingApproval },
        { "approved", ClaimStatus.Approved },
        { "paid", ClaimStatus.Paid },
        { "rejected", ClaimStatus.Rejected },
        { "cancelled", ClaimStatus.Cancelled }
    };

        public static bool TryGetClaimStatus(string routeValue, out ClaimStatus status)
        {
            return _statusMap.TryGetValue(routeValue, out status);
        }
    }
}
