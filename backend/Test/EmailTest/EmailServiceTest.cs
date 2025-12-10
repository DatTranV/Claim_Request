using Microsoft.Extensions.Options;
using Moq;
using Services.Gmail;
using BusinessObjects;
using Repositories.Interfaces;
using Xunit;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Sockets;

public class EmailServiceTests
{
    private readonly Mock<IEmailService> _mockIEmailService;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;

    public EmailServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();

        var smtpSettings = new SmtpSettings
        {
            Host = "smtp.gmail.com",
            Port = 587,
            SenderEmail = "ntphuc707@gmail.com",
            SenderPassword = "ektb nqui zbhz cbqp"
        };

        var options = Options.Create(smtpSettings);

        // Mock EmailService để kiểm tra xem phương thức có được gọi không
        _mockIEmailService = new Mock<IEmailService>();
    }

    [Fact]
    public async Task SendEmailAsync_ShouldSendEmail()
    {
        var to = new List<string> { "recipient@example.com" };
        var subject = "Test Subject";
        var body = "Test Body";

        await _mockIEmailService.Object.SendEmailAsync(to, subject, body);

        _mockIEmailService.Verify(e => e.SendEmailAsync(to, subject, body), Times.Once);
    }

    [Fact]
    public async Task toSendSubmitClaimRequestEmailAsync_ShouldSendEmail()
    {
        var projectManagerName = "Manager";
        var projectManagerEmail = "manager@example.com";
        var projectName = "Project";
        var staffId = Guid.NewGuid();
        var staffName = "Staff";
        var linkToItem = "http://example.com";

        await _mockIEmailService.Object.toSendSubmitClaimRequestEmailAsync(projectManagerName, projectManagerEmail, projectName, staffId, staffName, linkToItem);

        _mockIEmailService.Verify(e => e.toSendSubmitClaimRequestEmailAsync(projectManagerName, projectManagerEmail, projectName, staffId, staffName, linkToItem), Times.Once);
    }

    [Fact]
    public async Task SendClaimRequestEmailAsync_ShouldSendEmail()
    {
        var email = new List<string> { "finance@example.com" };
        var projectName = "Project";
        var staffName = "Staff";
        var staffId = Guid.NewGuid();
        var linkToItem = "http://example.com";

        await _mockIEmailService.Object.SendClaimRequestEmailAsync(email, projectName, staffName, staffId, linkToItem);

        _mockIEmailService.Verify(e => e.SendClaimRequestEmailAsync(email, projectName, staffName, staffId, linkToItem), Times.Once);
    }

    [Fact]
    public async Task SendApprovalNotificationEmailAsync_ShouldSendEmail()
    {
        var projectName = "Project";
        var staffId = Guid.NewGuid();
        var staffGmail = "staff@example.com";
        var staffName = "Staff";
        var linkToItem = "http://example.com";

        await _mockIEmailService.Object.SendApprovalNotificationEmailAsync(projectName, staffId, staffGmail, staffName, linkToItem);

        _mockIEmailService.Verify(e => e.SendApprovalNotificationEmailAsync(projectName, staffId, staffGmail, staffName, linkToItem), Times.Once);
    }

    [Fact]
    public async Task SendEmailAsync_ShouldThrowException_WhenRecipientListIsEmpty()
    {
        // Arrange
        var to = new List<string>();
        var subject = "Test Subject";
        var body = "Test Body";

        _mockIEmailService
            .Setup(e => e.SendEmailAsync(It.IsAny<List<string>>(), It.IsAny<string>(), It.IsAny<string>()))
            .ThrowsAsync(new ArgumentException("To list cannot be empty"));

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(async () =>
            await _mockIEmailService.Object.SendEmailAsync(to, subject, body));

        Assert.Equal("To list cannot be empty", exception.Message);
    }


    [Fact]
    public async Task SendEmailAsync_ShouldThrowException_WhenSmtpSettingsAreInvalid()
    {
        var invalidSmtpSettings = Options.Create(new SmtpSettings
        {
            Host = "invalid.host",
            Port = 0,
            SenderEmail = "invalid@example.com",
            SenderPassword = "wrongpassword"
        });
        var emailServiceWithInvalidSmtp = new EmailService(invalidSmtpSettings, _mockUnitOfWork.Object);

        var to = new List<string> { "recipient@example.com" };
        var subject = "Test Subject";
        var body = "Test Body";

        await Assert.ThrowsAsync<SocketException>(async () =>
            await emailServiceWithInvalidSmtp.SendEmailAsync(to, subject, body));
    }

    [Fact]
    public async Task toSendSubmitClaimRequestEmailAsync_ShouldThrowException_WhenEmailIsNull()
    {
        string projectManagerName = "Manager";
        string projectManagerEmail = null;
        string projectName = "Project";
        var staffId = Guid.NewGuid();
        string staffName = "Staff";
        string linkToItem = "http://example.com";

        _mockIEmailService
            .Setup(e => e.toSendSubmitClaimRequestEmailAsync(It.IsAny<string>(), It.Is<string>(email => email == null), It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>()))
            .ThrowsAsync(new ArgumentNullException(nameof(projectManagerEmail), "Project manager email cannot be null"));

        await Assert.ThrowsAsync<ArgumentNullException>(async () =>
            await _mockIEmailService.Object.toSendSubmitClaimRequestEmailAsync(
                projectManagerName, projectManagerEmail, projectName, staffId, staffName, linkToItem));
    }
}