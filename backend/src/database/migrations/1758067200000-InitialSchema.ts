import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1758067200000 implements MigrationInterface {
  name = 'InitialSchema1758067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "slug" character varying(100) NOT NULL,
        "plan" character varying(50) NOT NULL DEFAULT 'free',
        "branding" jsonb,
        "settings" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_organizations_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_organizations" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255),
        "name" character varying(255),
        "avatar_url" character varying(500),
        "role" character varying(50) NOT NULL DEFAULT 'rep',
        "status" character varying(50) NOT NULL DEFAULT 'active',
        "permissions" jsonb,
        "last_login" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "FK_users_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_users_org_email" ON "users" ("org_id", "email")`,
    );

    await queryRunner.query(`
      CREATE TABLE "companies" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "cnpj" character varying(20),
        "razao_social" character varying(255) NOT NULL,
        "nome_fantasia" character varying(255),
        "segment" character varying(100),
        "website" character varying(500),
        "phone" character varying(20),
        "email" character varying(255),
        "address" jsonb,
        "seu_zuca_id" character varying(100),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_companies" PRIMARY KEY ("id"),
        CONSTRAINT "FK_companies_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "contacts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "type" character varying(50) NOT NULL DEFAULT 'individual',
        "name" character varying(255) NOT NULL,
        "email" character varying(255),
        "phone" character varying(20),
        "cnpj_cpf" character varying(20),
        "avatar_url" character varying(500),
        "tags" text array,
        "custom_fields" jsonb,
        "linked_company_id" uuid,
        "created_by" uuid,
        "updated_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contacts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_contacts_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_contacts_company" FOREIGN KEY ("linked_company_id") REFERENCES "companies"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_contacts_org_company" ON "contacts" ("org_id", "linked_company_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "deals" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "contact_id" uuid,
        "company_id" uuid,
        "title" character varying(255) NOT NULL,
        "description" text,
        "value" numeric(12,2),
        "currency" character varying(3) NOT NULL DEFAULT 'BRL',
        "stage" character varying(50) NOT NULL DEFAULT 'lead',
        "probability" integer NOT NULL DEFAULT 50,
        "expected_close_date" date,
        "owner_id" uuid,
        "status" character varying(50) NOT NULL DEFAULT 'active',
        "linked_seu_zuca_pedido_id" character varying(100),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "closed_at" TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_deals" PRIMARY KEY ("id"),
        CONSTRAINT "FK_deals_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_deals_contact" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_deals_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_deals_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_deals_org_stage_owner" ON "deals" ("org_id", "stage", "owner_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "activities" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "contact_id" uuid,
        "deal_id" uuid,
        "company_id" uuid,
        "type" character varying(50) NOT NULL,
        "title" character varying(255),
        "description" text,
        "duration_minutes" integer,
        "transcription" text,
        "assigned_to" uuid,
        "completed_at" TIMESTAMP,
        "created_by" uuid,
        "updated_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activities" PRIMARY KEY ("id"),
        CONSTRAINT "FK_activities_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_activities_contact" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_activities_deal" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_activities_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_activities_org_contact_created" ON "activities" ("org_id", "contact_id", "created_at" DESC)`,
    );

    await queryRunner.query(`
      CREATE TABLE "automations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "trigger" character varying(100),
        "trigger_config" jsonb,
        "actions" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_automations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_automations_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "integrations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "type" character varying(100) NOT NULL,
        "access_token" text,
        "refresh_token" text,
        "config" jsonb,
        "last_sync" TIMESTAMP,
        "sync_status" character varying(50) NOT NULL DEFAULT 'idle',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_integrations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_integrations_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "integrations"`);
    await queryRunner.query(`DROP TABLE "automations"`);
    await queryRunner.query(`DROP TABLE "activities"`);
    await queryRunner.query(`DROP TABLE "deals"`);
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
  }
}
