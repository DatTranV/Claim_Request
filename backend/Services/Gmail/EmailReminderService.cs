using Microsoft.Extensions.Hosting;
using Quartz;

public class EmailReminderService : IHostedService
{
    // this class just for configuring about Remind Email, you can change when you send at line 27 


    private readonly ISchedulerFactory _schedulerFactory;
    private IScheduler _scheduler;

    public EmailReminderService(ISchedulerFactory schedulerFactory)
    {
        _schedulerFactory = schedulerFactory;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _scheduler = await _schedulerFactory.GetScheduler();

        var job = JobBuilder.Create<SendEmailJob>()
            .WithIdentity("sendEmailJob", "emailGroup")
            .Build();

        var trigger = TriggerBuilder.Create()
            .WithIdentity("sendEmailTrigger", "emailGroup")
            .StartNow()
            .WithSchedule(CronScheduleBuilder.DailyAtHourAndMinute(01, 00))  // Lên lịch gửi email vào 10h15 sáng mỗi ngày
            .Build();

        await _scheduler.ScheduleJob(job, trigger);
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return _scheduler?.Shutdown() ?? Task.CompletedTask;
    }
}
