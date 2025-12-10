using BusinessObjects;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Repositories
{
    public partial class ClaimRequestDbContext : IdentityDbContext<User, Role, Guid>
    {
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectEnrollment> ProjectEnrollments { get; set; }
        public DbSet<ClaimRequest> ClaimRequests { get; set; }
        public DbSet<ClaimDetail> ClaimDetails { get; set; }
        public DbSet<AuditTrail> AuditTrails { get; set; }
        public ClaimRequestDbContext(DbContextOptions<ClaimRequestDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Role>().ToTable("Roles");
            modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
            modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
            modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
            modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
            modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");

            modelBuilder.Entity<AuditTrail>(entity =>
            {              
                entity.HasOne(d => d.User)
                      .WithMany(p => p.AuditTrails)
                      .HasForeignKey(d => d.ActionBy);

                entity.HasOne(d => d.ClaimRequest)
                      .WithMany(p => p.AuditTrails)
                      .HasForeignKey(d => d.ClaimId);

                entity.Property(d => d.UserAction)
                    .HasConversion<string>();
            });

            modelBuilder.Entity<ClaimRequest>(entity =>
            {
                entity.HasOne(d => d.Project)
                      .WithMany(p => p.ClaimRequests)
                      .HasForeignKey(d => d.ProjectId);
               
                entity.HasOne(d => d.Creator)
                      .WithMany(p => p.ClaimRequests)
                      .HasForeignKey(d => d.CreatorId);

                entity.Property(d => d.Status)
                    .HasConversion<string>();
            });

            modelBuilder.Entity<ClaimDetail>(entity =>
            {
                entity.HasOne(d => d.ClaimRequest)
                      .WithMany(p => p.ClaimDetails)
                      .HasForeignKey(d => d.ClaimId);
            });

            modelBuilder.Entity<Project>(entity =>
            {
                entity.Property(d => d.Status)
                    .HasConversion<string>();
            });


            modelBuilder.Entity<ProjectEnrollment>(entity =>
            {
                entity.Property(pr => pr.ProjectRole)
                    .HasConversion<string>();
                entity.HasOne(pe => pe.Project)
                    .WithMany(p => p.ProjectEnrollments)
                    .HasForeignKey(pe => pe.ProjectId);
                entity.HasOne(pe => pe.User)
                    .WithMany(u => u.ProjectEnrollments)
                    .HasForeignKey(pe => pe.UserId);
            });   
            
            modelBuilder.Entity<User>()
                .Property(u => u.Department)
                .HasConversion<string>();
            modelBuilder.Entity<User>()
                .Property(u => u.Rank)
                .HasConversion<string>();
        }
    }    
}