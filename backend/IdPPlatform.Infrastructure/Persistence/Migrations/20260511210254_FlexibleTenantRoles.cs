using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IdPPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FlexibleTenantRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "users",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tenant_roles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    key = table.Column<string>(type: "varchar(63)", maxLength: 63, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    name = table.Column<string>(type: "varchar(120)", maxLength: 120, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_system = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    is_active = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    tenant_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tenant_roles", x => x.id);
                    table.ForeignKey(
                        name: "FK_tenant_roles_tenants_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tenant_invite_roles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    invite_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    role_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    tenant_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tenant_invite_roles", x => x.id);
                    table.ForeignKey(
                        name: "FK_tenant_invite_roles_tenant_invites_invite_id",
                        column: x => x.invite_id,
                        principalTable: "tenant_invites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tenant_invite_roles_tenant_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "tenant_roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tenant_membership_roles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    membership_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    role_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    tenant_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tenant_membership_roles", x => x.id);
                    table.ForeignKey(
                        name: "FK_tenant_membership_roles_tenant_memberships_membership_id",
                        column: x => x.membership_id,
                        principalTable: "tenant_memberships",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tenant_membership_roles_tenant_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "tenant_roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_tenant_invite_roles_invite_id_role_id",
                table: "tenant_invite_roles",
                columns: new[] { "invite_id", "role_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tenant_invite_roles_role_id",
                table: "tenant_invite_roles",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_tenant_invite_roles_tenant_id",
                table: "tenant_invite_roles",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_tenant_membership_roles_membership_id_role_id",
                table: "tenant_membership_roles",
                columns: new[] { "membership_id", "role_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tenant_membership_roles_role_id",
                table: "tenant_membership_roles",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_tenant_membership_roles_tenant_id",
                table: "tenant_membership_roles",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_tenant_roles_tenant_id",
                table: "tenant_roles",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_tenant_roles_tenant_id_key",
                table: "tenant_roles",
                columns: new[] { "tenant_id", "key" },
                unique: true);

            migrationBuilder.Sql("""
                INSERT INTO tenant_roles (id, `key`, name, description, is_system, is_active, created_at, updated_at, tenant_id)
                SELECT UUID(), role_seed.`key`, role_seed.name, NULL, TRUE, TRUE, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), tenants.id
                FROM tenants
                JOIN (
                    SELECT 'owner' AS `key`, 'Owner' AS name
                    UNION ALL SELECT 'admin', 'Admin'
                    UNION ALL SELECT 'member', 'Member'
                    UNION ALL SELECT 'viewer', 'Viewer'
                ) AS role_seed;
                """);

            migrationBuilder.Sql("""
                INSERT INTO tenant_membership_roles (id, membership_id, role_id, created_at, updated_at, tenant_id)
                SELECT UUID(), memberships.id, roles.id, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), memberships.tenant_id
                FROM tenant_memberships AS memberships
                JOIN tenant_roles AS roles
                    ON roles.tenant_id = memberships.tenant_id
                    AND roles.`key` = CASE memberships.role
                        WHEN 0 THEN 'owner'
                        WHEN 1 THEN 'admin'
                        WHEN 2 THEN 'member'
                        WHEN 3 THEN 'viewer'
                        ELSE 'viewer'
                    END;
                """);

            migrationBuilder.Sql("""
                INSERT INTO tenant_invite_roles (id, invite_id, role_id, created_at, updated_at, tenant_id)
                SELECT UUID(), invites.id, roles.id, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), invites.tenant_id
                FROM tenant_invites AS invites
                JOIN tenant_roles AS roles
                    ON roles.tenant_id = invites.tenant_id
                    AND roles.`key` = CASE invites.role
                        WHEN 0 THEN 'owner'
                        WHEN 1 THEN 'admin'
                        WHEN 2 THEN 'member'
                        WHEN 3 THEN 'viewer'
                        ELSE 'viewer'
                    END;
                """);

            migrationBuilder.DropColumn(
                name: "role",
                table: "tenant_memberships");

            migrationBuilder.DropColumn(
                name: "role",
                table: "tenant_invites");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "role",
                table: "tenant_memberships",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "role",
                table: "tenant_invites",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql("""
                UPDATE tenant_memberships AS memberships
                JOIN (
                    SELECT membership_roles.membership_id, MIN(
                        CASE roles.`key`
                            WHEN 'owner' THEN 0
                            WHEN 'admin' THEN 1
                            WHEN 'member' THEN 2
                            WHEN 'viewer' THEN 3
                            ELSE 3
                        END
                    ) AS legacy_role
                    FROM tenant_membership_roles AS membership_roles
                    JOIN tenant_roles AS roles ON roles.id = membership_roles.role_id
                    GROUP BY membership_roles.membership_id
                ) AS mapped_roles ON mapped_roles.membership_id = memberships.id
                SET memberships.role = mapped_roles.legacy_role;
                """);

            migrationBuilder.Sql("""
                UPDATE tenant_invites AS invites
                JOIN (
                    SELECT invite_roles.invite_id, MIN(
                        CASE roles.`key`
                            WHEN 'owner' THEN 0
                            WHEN 'admin' THEN 1
                            WHEN 'member' THEN 2
                            WHEN 'viewer' THEN 3
                            ELSE 3
                        END
                    ) AS legacy_role
                    FROM tenant_invite_roles AS invite_roles
                    JOIN tenant_roles AS roles ON roles.id = invite_roles.role_id
                    GROUP BY invite_roles.invite_id
                ) AS mapped_roles ON mapped_roles.invite_id = invites.id
                SET invites.role = mapped_roles.legacy_role;
                """);

            migrationBuilder.DropTable(
                name: "tenant_invite_roles");

            migrationBuilder.DropTable(
                name: "tenant_membership_roles");

            migrationBuilder.DropTable(
                name: "tenant_roles");

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "users",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
