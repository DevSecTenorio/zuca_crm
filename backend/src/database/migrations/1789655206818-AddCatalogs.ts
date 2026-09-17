import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCatalogs1789655206818 implements MigrationInterface {
  name = 'AddCatalogs1789655206818';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const simpleCatalogTables = [
      { table: 'lead_sources', fk: 'FK_lead_sources_org' },
      { table: 'campaigns', fk: 'FK_campaigns_org' },
      { table: 'loss_reasons', fk: 'FK_loss_reasons_org' },
      { table: 'segments', fk: 'FK_segments_org' },
    ];

    for (const { table, fk } of simpleCatalogTables) {
      await queryRunner.query(`
        CREATE TABLE "${table}" (
          "id" uuid NOT NULL DEFAULT gen_random_uuid(),
          "org_id" uuid NOT NULL,
          "name" character varying(100) NOT NULL,
          "active" boolean NOT NULL DEFAULT true,
          "order" integer NOT NULL DEFAULT 0,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_${table}" PRIMARY KEY ("id"),
          CONSTRAINT "${fk}" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE
        )
      `);
      await queryRunner.query(
        `CREATE INDEX "idx_${table}_org" ON "${table}" ("org_id")`,
      );
    }

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "price" numeric(12,2),
        "sku" character varying(100),
        "active" boolean NOT NULL DEFAULT true,
        "order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_products_org" ON "products" ("org_id")`,
    );

    // Contacts: fonte / campanha
    await queryRunner.query(
      `ALTER TABLE "contacts" ADD COLUMN "source_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" ADD COLUMN "campaign_id" uuid`,
    );
    await queryRunner.query(`
      ALTER TABLE "contacts" ADD CONSTRAINT "FK_contacts_source"
        FOREIGN KEY ("source_id") REFERENCES "lead_sources"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "contacts" ADD CONSTRAINT "FK_contacts_campaign"
        FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL
    `);

    // Deals: motivo de perda + produtos/serviços
    await queryRunner.query(
      `ALTER TABLE "deals" ADD COLUMN "loss_reason_id" uuid`,
    );
    await queryRunner.query(`
      ALTER TABLE "deals" ADD CONSTRAINT "FK_deals_loss_reason"
        FOREIGN KEY ("loss_reason_id") REFERENCES "loss_reasons"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      CREATE TABLE "deal_products" (
        "deal_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        CONSTRAINT "PK_deal_products" PRIMARY KEY ("deal_id", "product_id"),
        CONSTRAINT "FK_deal_products_deal" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_deal_products_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    // Companies: segmento passa de texto livre para catálogo
    await queryRunner.query(
      `ALTER TABLE "companies" ADD COLUMN "segment_id" uuid`,
    );
    await queryRunner.query(`
      INSERT INTO "segments" ("id", "org_id", "name", "order")
      SELECT gen_random_uuid(), s."org_id", s."name", 0
      FROM (
        SELECT DISTINCT "org_id", "segment" AS "name"
        FROM "companies"
        WHERE "segment" IS NOT NULL AND "segment" <> ''
      ) s
    `);
    await queryRunner.query(`
      UPDATE "companies" c SET "segment_id" = s."id"
      FROM "segments" s
      WHERE s."org_id" = c."org_id" AND s."name" = c."segment"
    `);
    await queryRunner.query(`
      ALTER TABLE "companies" ADD CONSTRAINT "FK_companies_segment"
        FOREIGN KEY ("segment_id") REFERENCES "segments"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "segment"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies" ADD COLUMN "segment" character varying(100)`,
    );
    await queryRunner.query(`
      UPDATE "companies" c SET "segment" = s."name"
      FROM "segments" s
      WHERE s."id" = c."segment_id"
    `);
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_companies_segment"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "segment_id"`);

    await queryRunner.query(`DROP TABLE "deal_products"`);
    await queryRunner.query(
      `ALTER TABLE "deals" DROP CONSTRAINT "FK_deals_loss_reason"`,
    );
    await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN "loss_reason_id"`);

    await queryRunner.query(
      `ALTER TABLE "contacts" DROP CONSTRAINT "FK_contacts_campaign"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" DROP CONSTRAINT "FK_contacts_source"`,
    );
    await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN "campaign_id"`);
    await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN "source_id"`);

    await queryRunner.query(`DROP TABLE "products"`);
    for (const table of [
      'segments',
      'loss_reasons',
      'campaigns',
      'lead_sources',
    ]) {
      await queryRunner.query(`DROP TABLE "${table}"`);
    }
  }
}
