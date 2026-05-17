using IdPPlatform.Domain.Entities;
using IdPPlatform.Infrastructure.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IdPPlatform.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : BaseEntityConfiguration<User>
{
    public override void Configure(EntityTypeBuilder<User> builder)
    {
        base.Configure(builder);

        builder.ToTable("users");

        builder.OwnsOne(
            x => x.Email,
            b => b.Property(y => y.Value)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired());

        builder.Navigation(x => x.Email)
            .IsRequired();

        builder.Property(x => x.DisplayName)
            .HasColumnName("display_name")
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(x => x.PhotoUrl)
            .HasColumnName("photo_url")
            .HasMaxLength(500);

        builder.Property(x => x.IsActive)
            .HasColumnName("is_active")
            .IsRequired();

        builder.Property(x => x.IsPlatformAdmin)
            .HasColumnName("is_platform_admin")
            .IsRequired();

        builder.HasIndex(x => x.IsPlatformAdmin)
            .HasDatabaseName("IX_users_single_platform_admin")
            .IsUnique()
            .HasFilter("is_platform_admin = true");
    }
}
