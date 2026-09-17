import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSalesGoals1789661350815 implements MigrationInterface {
  name = 'AddSalesGoals1789661350815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "sales_goals" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "year" integer NOT NULL,
        "month" integer NOT NULL,
        "target_value" numeric(12,2) NOT NULL DEFAULT 0,
        "target_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sales_goals" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sales_goals_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sales_goals_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_sales_goals_org_user_period" ON "sales_goals" ("org_id", "user_id", "year", "month")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sales_goals"`);
  }
}
