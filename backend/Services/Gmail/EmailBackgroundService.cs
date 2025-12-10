using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace Services.Gmail
{
    public class EmailBackgroundService : BackgroundService
    {

        private readonly EmailQueue _emailQueue;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly ILogger<EmailBackgroundService> _logger;

        public EmailBackgroundService(EmailQueue emailQueue, IServiceScopeFactory serviceScopeFactory, ILogger<EmailBackgroundService> logger)
        {
            _emailQueue = emailQueue;
            _serviceScopeFactory = serviceScopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Email Background Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var emailRequest = await _emailQueue.DequeueEmailAsync(stoppingToken);
                    if (emailRequest != null)
                    {
                        using (var scope = _serviceScopeFactory.CreateScope()) // Tạo scope mới
                        {
                            var emailService = scope.ServiceProvider.GetRequiredService<EmailService>(); // Lấy EmailService từ scope
                            await emailService.SendEmailAsync(new List<string> { emailRequest.To }, emailRequest.Subject, emailRequest.Body);
                            _logger.LogInformation($"Email sent to {emailRequest.To}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error occurred while sending email: {ex.Message}");
                }
            }

            _logger.LogInformation("Email Background Service is stopping.");
        }
    }
}
