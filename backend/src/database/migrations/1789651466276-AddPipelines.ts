import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPipelines1789651466276 implements MigrationInterface {
  name = 'AddPipelines1789651466276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "pipelines" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pipelines" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pipelines_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_pipelines_org" ON "pipelines" ("org_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "pipeline_stages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "pipeline_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "order" integer NOT NULL DEFAULT 0,
        "probability" integer NOT NULL DEFAULT 50,
        "is_won" boolean NOT NULL DEFAULT false,
        "is_lost" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pipeline_stages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pipeline_stages_pipeline" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_pipeline_stages_pipeline_order" ON "pipeline_stages" ("pipeline_id", "order")`,
    );

    await queryRunner.query(`
      CREATE TABLE "pipeline_members" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "pipeline_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pipeline_members" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pipeline_members_pipeline" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pipeline_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_pipeline_members_pipeline_user" UNIQUE ("pipeline_id", "user_id")
      )
    `);

    // One default pipeline per existing organization, seeded from the
    // stage set that used to be hardcoded as the global DealStage enum.
    await queryRunner.query(`
      INSERT INTO "pipelines" ("id", "org_id", "name", "is_default", "order")
      SELECT gen_random_uuid(), "id", 'Pipeline Padrão', true, 0
      FROM "organizations"
    `);

    await queryRunner.query(`
      INSERT INTO "pipeline_stages" ("id", "pipeline_id", "name", "order", "probability", "is_won", "is_lost")
      SELECT gen_random_uuid(), p."id", s.name, s.ord, s.prob, s.won, s.lost
      FROM "pipelines" p
      CROSS JOIN (VALUES
        ('Lead', 0, 20, false, false),
        ('Proposta', 1, 50, false, false),
        ('Negociação', 2, 75, false, false),
        ('Ganho', 3, 100, true, false),
        ('Perdido', 4, 0, false, true)
      ) AS s(name, ord, prob, won, lost)
      WHERE p."is_default" = true
    `);

    // Give every existing org member access to the default pipeline so the
    // new access-control model doesn't lock anyone out of their own deals.
    await queryRunner.query(`
      INSERT INTO "pipeline_members" ("id", "pipeline_id", "user_id")
      SELECT gen_random_uuid(), p."id", u."id"
      FROM "pipelines" p
      JOIN "users" u ON u."org_id" = p."org_id"
      WHERE p."is_default" = true
    `);

    await queryRunner.query(
      `ALTER TABLE "deals" ADD COLUMN "pipeline_id" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN "stage_id" uuid`);

    await queryRunner.query(`
      UPDATE "deals" d SET "pipeline_id" = p."id"
      FROM "pipelines" p
      WHERE p."org_id" = d."org_id" AND p."is_default" = true
    `);

    await queryRunner.query(`
      UPDATE "deals" d SET "stage_id" = ps."id"
      FROM "pipeline_stages" ps
      WHERE ps."pipeline_id" = d."pipeline_id"
        AND ps."name" = CASE d."stage"
          WHEN 'lead' THEN 'Lead'
          WHEN 'proposal' THEN 'Proposta'
          WHEN 'negotiation' THEN 'Negociação'
          WHEN 'won' THEN 'Ganho'
          WHEN 'lost' THEN 'Perdido'
        END
    `);

    await queryRunner.query(
      `ALTER TABLE "deals" ALTER COLUMN "pipeline_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "deals" ALTER COLUMN "stage_id" SET NOT NULL`,
    );
    await queryRunner.query(`
      ALTER TABLE "deals" ADD CONSTRAINT "FK_deals_pipeline"
        FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      ALTER TABLE "deals" ADD CONSTRAINT "FK_deals_stage"
        FOREIGN KEY ("stage_id") REFERENCES "pipeline_stages"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`DROP INDEX "idx_deals_org_stage_owner"`);
    await queryRunner.query(
      `CREATE INDEX "idx_deals_org_pipeline_stage_owner" ON "deals" ("org_id", "pipeline_id", "stage_id", "owner_id")`,
    );
    await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN "stage"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "deals" ADD COLUMN "stage" character varying(50) NOT NULL DEFAULT 'lead'`,
    );
    await queryRunner.query(`
      UPDATE "deals" d SET "stage" = CASE ps."name"
        WHEN 'Lead' THEN 'lead'
        WHEN 'Proposta' THEN 'proposal'
        WHEN 'Negociação' THEN 'negotiation'
        WHEN 'Ganho' THEN 'won'
        WHEN 'Perdido' THEN 'lost'
        ELSE 'lead'
      END
      FROM "pipeline_stages" ps
      WHERE ps."id" = d."stage_id"
    `);

    await queryRunner.query(`DROP INDEX "idx_deals_org_pipeline_stage_owner"`);
    await queryRunner.query(
      `CREATE INDEX "idx_deals_org_stage_owner" ON "deals" ("org_id", "stage", "owner_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "deals" DROP CONSTRAINT "FK_deals_stage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deals" DROP CONSTRAINT "FK_deals_pipeline"`,
    );
    await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN "stage_id"`);
    await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN "pipeline_id"`);

    await queryRunner.query(`DROP TABLE "pipeline_members"`);
    await queryRunner.query(`DROP TABLE "pipeline_stages"`);
    await queryRunner.query(`DROP TABLE "pipelines"`);
  }
}
