import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttachments1789698165138 implements MigrationInterface {
  name = 'AddAttachments1789698165138';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "attachments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "entity_type" varchar(20) NOT NULL,
        "entity_id" uuid NOT NULL,
        "file_name" varchar(255) NOT NULL,
        "storage_path" varchar(500) NOT NULL,
        "mime_type" varchar(150),
        "size_bytes" bigint NOT NULL,
        "uploaded_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_attachments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_attachments_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_attachments_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_attachments_entity" ON "attachments" ("org_id", "entity_type", "entity_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "attachments"`);
  }
}
