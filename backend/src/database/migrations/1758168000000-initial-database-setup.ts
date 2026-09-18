import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialDatabaseSetup1758168000000
  implements MigrationInterface
{
  name = 'InitialDatabaseSetup1758168000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP EXTENSION IF EXISTS pgcrypto');
  }
}
