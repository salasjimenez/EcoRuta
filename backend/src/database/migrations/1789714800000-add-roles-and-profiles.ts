import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRolesAndProfiles1789714800000 implements MigrationInterface {
  name = 'AddRolesAndProfiles1789714800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM ('transporter', 'company', 'admin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" "user_role_enum" NOT NULL DEFAULT 'transporter'`,
    );

    await queryRunner.query(`
      CREATE TABLE "transporter_profiles" (
        "user_id" uuid NOT NULL,
        "phone_number" character varying(30),
        "base_city" character varying(120),
        "bio" character varying(500),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transporter_profiles_user_id" PRIMARY KEY ("user_id"),
        CONSTRAINT "FK_transporter_profiles_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "company_profiles" (
        "user_id" uuid NOT NULL,
        "company_name" character varying(160),
        "tax_id" character varying(30),
        "phone_number" character varying(30),
        "base_city" character varying(120),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_company_profiles_user_id" PRIMARY KEY ("user_id"),
        CONSTRAINT "FK_company_profiles_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "admin_profiles" (
        "user_id" uuid NOT NULL,
        "department" character varying(120),
        "job_title" character varying(120),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_profiles_user_id" PRIMARY KEY ("user_id"),
        CONSTRAINT "FK_admin_profiles_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      INSERT INTO "transporter_profiles" ("user_id")
      SELECT "id" FROM "users" WHERE "role" = 'transporter'
      ON CONFLICT ("user_id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "admin_profiles"`);
    await queryRunner.query(`DROP TABLE "company_profiles"`);
    await queryRunner.query(`DROP TABLE "transporter_profiles"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
