using Microsoft.EntityFrameworkCore;
using Quartz;
using Microsoft.Extensions.Logging;
using Services.Gmail;
using Repositories;
using System.Text;

public class SendEmailJob : IJob
{
    private readonly ClaimRequestDbContext _dbContext;
    private readonly EmailService _emailService;
    private readonly ILogger<SendEmailJob> _logger;

    public SendEmailJob(ClaimRequestDbContext dbContext, EmailService emailService, ILogger<SendEmailJob> logger)
    {
        _dbContext = dbContext;
        _emailService = emailService;
        _logger = logger;
    }

    // execute hosted gmail reminder, dont mind on it, trust me bro 
    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("SendEmailJob started at {Time}", DateTime.Now);

        try
        {
            // Lấy danh sách email từ DB
            var emails = await _dbContext.Users.
                                           Where(o => o.RoleName.ToUpper().Equals("APPROVER"))
                                          .Select(a => a.Email)
                                          .ToListAsync();

            if (emails.Any())
            {
                // Gửi email đến danh sách
                await _emailService.SendPendingApprovalEmailAsync(emails);
                _logger.LogInformation("Emails successfully sent at {Time}", DateTime.Now);
            }
            else
            {
                _logger.LogWarning("No email addresses found in the database at {Time}", DateTime.Now);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while sending email at {Time}", DateTime.Now);
        }
    }

    //public string GenerateBodyEmailJob()
    //{
    //    var sb = new StringBuilder();
    //}
}
