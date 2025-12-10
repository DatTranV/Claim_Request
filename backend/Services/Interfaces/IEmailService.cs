namespace Services.Gmail
{
    public interface IEmailService
    {
        Task SendEmailAsync(List<string> to, string subject, string body);
        Task SendEmailAsync(string to, string subject, string body);

        Task toSendSubmitClaimRequestEmailAsync(string projectManagerName, string projectManagerEmail, string projectName, Guid staffId, string staffName, string linkToItem);
        Task SendClaimRequestEmailAsync(List<string> email, string projectName, string staffName, Guid staffId, string linkToItem);
        Task SendApprovalNotificationEmailAsync(string projectName, Guid staffId, string staffGmail, string staffName, string linkToItem);
        Task toSendReturnNotificationEmailAsync(string projectName, Guid staffId, string staffGmail, string staffName, string linkToItem);
        Task SendPendingApprovalEmailAsync(List<string> approver);
        Task SendRejectNotificationEmailAsync(string projectName, Guid staffId, string staffGmail, string staffName);
    }
}
