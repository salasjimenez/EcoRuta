import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVehicles1789797600000 implements MigrationInterface {
  name = 'CreateVehicles1789797600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "vehicle_type_enum" AS ENUM (
        'cargo_van',
        'pickup',
        'light_truck',
        'medium_truck',
        'heavy_truck',
        'refrigerated_truck'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "cargo_type_enum" AS ENUM (
        'general',
        'food',
        'perishable',
        'refrigerated',
        'fragile',
        'textile',
        'electronics',
        'construction_materials',
        'other'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "vehicles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "owner_id" uuid NOT NULL,
        "plate_number" character varying(20) NOT NULL,
        "make" character varying(80) NOT NULL,
        "model" character varying(80) NOT NULL,
        "year" smallint NOT NULL,
        "vehicle_type" "vehicle_type_enum" NOT NULL,
        "max_weight_kg" double precision NOT NULL,
        "max_volume_m3" double precision NOT NULL,
        "cargo_types" "cargo_type_enum"[] NOT NULL,
        "is_available" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vehicles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_vehicles_plate_number" UNIQUE ("plate_number"),
        CONSTRAINT "FK_vehicles_owner" FOREIGN KEY ("owner_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_vehicles_year" CHECK ("year" >= 1950 AND "year" <= 2100),
        CONSTRAINT "CHK_vehicles_max_weight" CHECK ("max_weight_kg" > 0),
        CONSTRAINT "CHK_vehicles_max_volume" CHECK ("max_volume_m3" > 0),
        CONSTRAINT "CHK_vehicles_cargo_types" CHECK (cardinality("cargo_types") > 0)
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_vehicles_owner_id" ON "vehicles" ("owner_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_vehicles_owner_id"`);
    await queryRunner.query(`DROP TABLE "vehicles"`);
    await queryRunner.query(`DROP TYPE "cargo_type_enum"`);
    await queryRunner.query(`DROP TYPE "vehicle_type_enum"`);
  }
}
