import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAgendaAndAuditLog1789657457439 implements MigrationInterface {
  name = 'AddAgendaAndAuditLog1789657457439';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN "due_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_activities_org_due_at" ON "activities" ("org_id", "due_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "user_id" uuid,
        "action" character varying(100) NOT NULL,
        "entity_type" character varying(50),
        "entity_id" uuid,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_audit_logs_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_audit_logs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_audit_logs_org_created" ON "audit_logs" ("org_id", "created_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP INDEX "idx_activities_org_due_at"`);
    await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "due_at"`);
  }
}
