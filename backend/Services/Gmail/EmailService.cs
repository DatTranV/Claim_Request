using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MimeKit;
using Repositories.Interfaces;
using Microsoft.Extensions.Options;

namespace Services.Gmail
{
    public class EmailService : IEmailService
    {
        private readonly SmtpSettings? _smtpSettings;
        private readonly IUnitOfWork _unitOfWork;

        public EmailService(IOptions<SmtpSettings> smtpOptions, IUnitOfWork unitOfWork)
        {
            _smtpSettings = smtpOptions.Value;
            _unitOfWork = unitOfWork;
        }


        // này chỉ gửi mail thoi, nhập vào người nhận, tiêu đề, và body rồi gửi thoi

        public async Task SendEmailAsync(List<string> to, string subject, string body)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("System Administrator", _smtpSettings.SenderEmail));
            if (to == null || !to.Any() )
                throw new ArgumentException("To list cannot be empty", nameof(to));
            if (subject == null || !subject.Any())
                throw new ArgumentException("Subject list cannot be empty", nameof(subject));
            if (body == null || !body.Any())
                throw new ArgumentException("Body list cannot be empty", nameof(body));

            foreach (var recipient in to)
            {
                email.To.Add(MailboxAddress.Parse(recipient));
            }
            email.Subject = subject;
            email.Body = new TextPart("html")
            {
                Text = body
            };
            //mail

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_smtpSettings.SenderEmail, _smtpSettings.SenderPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
        // ET 1: Send email to Supervisor when Claimer submits Claim Request
        public async Task SendEmailAsync(string to, string subject, string body)
        {
            await SendEmailAsync(new List<string> { to }, subject, body);
        }

        public async Task toSendSubmitClaimRequestEmailAsync(string projectManagerName, string projectManagerEmail, string projectName, Guid staffId, string staffName, string linkToItem)
        {
            string subject = $"Claim Request {projectName} - {staffName} - {staffId}";
            string body = $@"
                            <p>Dear {projectManagerName},</p>
                            <p>Claim Request for <strong>{projectName}</strong> - <strong>{staffName}</strong> - <strong>{staffId}</strong> is submitted and waiting for approval.</p>
                            <p>Please access the Claim via the following link:</p>
                            <p><a href='{linkToItem}'>claimLink</a></p>
                            <br/>
                            <p>Sincerely,</p>
                            <p><strong>System Administrator</strong></p>
                            <p><i>Note: This is an auto-generated email, please do not reply.</i></p>";

            // Gọi hàm SendEmailAsync để gửi email
            await SendEmailAsync( projectManagerEmail, subject, body);
        }

        //ET 2: Send email to Finance group when Final Approver approves Claim Request
        public async Task SendClaimRequestEmailAsync(List<string> email, string projectName, string staffName, Guid staffId, string linkToItem)
        {
            
            string subject = $"Claim Request {projectName} - {staffName} - {staffId}";
            string body = $@"
                            Dear Finance team,<br><br>
                            Claim Request for {projectName} {staffName} - {staffId} is approved and pending for your action.<br>
                            Please access the Claim via the following link:<br>
                            <a href='{linkToItem}'>Link to item</a><br><br>
                            Sincerely,<br>
                            System Administrator<br>
                            <i>Note: This is an auto-generated email, please do not reply.</i>";

            await SendEmailAsync(email , subject, body);
        }

        //ET 3: Send email to creator when Approver approves Claim Request

        public async Task SendApprovalNotificationEmailAsync(string projectName, Guid staffId, string staffGmail, string staffName, string linkToItem)
        {
            string subject = $"Claim Request {projectName} - {staffName} - {staffId}";
            string body = $@"
                            Dear {staffName},<br><br>
                            Claim Request for {projectName} - {staffName} - {staffId} is Approved by approver.<br>
                            Please access the Claim via the following link:<br>
                            <a href='{linkToItem}'>Link to item</a><br><br>
                            Sincerely,<br>
                            System Administrator<br>
                            <i>Note: This is an auto-generated email, please do not reply.</i>";

            await SendEmailAsync(staffGmail, subject, body);
        }

        //ET 4: Send email to creator when Approver/Finance returns Claim Request


        public async Task toSendReturnNotificationEmailAsync(string projectName, Guid staffId, string staffGmail, string staffName, string linkToItem)
        {
            string subject = $"Claim Request {projectName} - {staffName} - {staffId}";
            string body = $@"
                        Dear {staffName},<br><br>
                        Claim Request for {projectName} {staffName} - {staffId} is returned.<br>
                        Please access the Claim via the following link:<br>
                        <a href='{linkToItem}'>Link to item</a><br><br>
                        Sincerely,<br>
                        System Administrator<br>
                        <i>Note: This is an auto-generated email, please do not reply.</i>";
            await SendEmailAsync(staffGmail, subject, body);
        }
        // ET 5: Send email to Approver for the list of pending approval Claims
        public async Task SendPendingApprovalEmailAsync(List<string> approver)
        {
            foreach (var email in approver)
            {

                string subject = "Pending Approval Claims";

                var user = await _unitOfWork.UserRepository.GetUserByEmailAsync(email.ToLower());
                if (user == null)
                    continue;
                string body = $@"
                        Dear {user.UserName},<br><br>
                        There is/are Claim(s) for the Staff below that has been pending for your approval:<br><br>";
                var pendingClaims = await _unitOfWork.ClaimRepository.GetPendingClaimsAsync();
                if (pendingClaims == null || !pendingClaims.Any())
                    continue;
                foreach (var claim in pendingClaims)
                {
                    var projectName = await _unitOfWork.ProjectRepository.GetByIdAsync(claim.ProjectId);
                    var staffName = await _unitOfWork.UserRepository.GetAccountDetailsAsync(claim.CreatorId);

                    body += $"{projectName.ProjectName} - {staffName.UserName} - {staffName.Id}<br>";
                    body += $"<a href='linkToItem'>Link to item</a><br><br>";
                }

                body += $@"
                    Sincerely,<br>
                    System Administrator<br>
                    <i>Note: This is an auto-generated email, please do not reply.</i>";

                await SendEmailAsync(email, subject, body);
            }
        }

        //ET 6: Send email to creator when Approver Rejected Claim Request
        public async Task SendRejectNotificationEmailAsync(string projectName, Guid staffId, string staffGmail, string staffName)
        {
            string subject = $"Claim Request {projectName} - {staffName} - {staffId}";
            string body = $@"
                            Dear {staffName},<br><br>
                            Claim Request for {projectName} - {staffName} - {staffId} is Rejected by approver.<br>
                            Please access the Claim via the following link:<br>
                            <a href='linkToItem'>Link to item</a><br><br>
                            Sincerely,<br>
                            System Administrator<br>
                            <i>Note: This is an auto-generated email, please do not reply.</i>";

            await SendEmailAsync(staffGmail, subject, body);
        }

    }
}
