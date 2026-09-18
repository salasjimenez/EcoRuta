import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1789700400000 implements MigrationInterface {
  name = 'CreateUsers1789700400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "full_name" varchar(120) NOT NULL,
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(60) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "CHK_users_email_lowercase" CHECK ("email" = lower("email"))
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "users"');
  }
}
