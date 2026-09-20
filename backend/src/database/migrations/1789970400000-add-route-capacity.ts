import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRouteCapacity1789970400000 implements MigrationInterface {
  name = 'AddRouteCapacity1789970400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "planned_routes"
        ADD COLUMN "offered_weight_kg" double precision NOT NULL DEFAULT 0,
        ADD COLUMN "reserved_weight_kg" double precision NOT NULL DEFAULT 0,
        ADD COLUMN "offered_volume_m3" double precision NOT NULL DEFAULT 0,
        ADD COLUMN "reserved_volume_m3" double precision NOT NULL DEFAULT 0,
        ADD COLUMN "accepted_cargo_types" "cargo_type_enum"[] NOT NULL DEFAULT ARRAY[]::"cargo_type_enum"[],
        ADD COLUMN "max_package_length_cm" double precision,
        ADD COLUMN "max_package_width_cm" double precision,
        ADD COLUMN "max_package_height_cm" double precision,
        ADD COLUMN "capacity_notes" character varying(300)
    `);

    await queryRunner.query(`
      ALTER TABLE "planned_routes"
        ADD CONSTRAINT "CHK_planned_routes_offered_weight"
          CHECK ("offered_weight_kg" >= 0),
        ADD CONSTRAINT "CHK_planned_routes_reserved_weight"
          CHECK (
            "reserved_weight_kg" >= 0
            AND "reserved_weight_kg" <= "offered_weight_kg"
          ),
        ADD CONSTRAINT "CHK_planned_routes_offered_volume"
          CHECK ("offered_volume_m3" >= 0),
        ADD CONSTRAINT "CHK_planned_routes_reserved_volume"
          CHECK (
            "reserved_volume_m3" >= 0
            AND "reserved_volume_m3" <= "offered_volume_m3"
          ),
        ADD CONSTRAINT "CHK_planned_routes_package_length"
          CHECK (
            "max_package_length_cm" IS NULL
            OR "max_package_length_cm" > 0
          ),
        ADD CONSTRAINT "CHK_planned_routes_package_width"
          CHECK (
            "max_package_width_cm" IS NULL
            OR "max_package_width_cm" > 0
          ),
        ADD CONSTRAINT "CHK_planned_routes_package_height"
          CHECK (
            "max_package_height_cm" IS NULL
            OR "max_package_height_cm" > 0
          ),
        ADD CONSTRAINT "CHK_planned_routes_package_dimensions"
          CHECK (
            (
              "max_package_length_cm" IS NULL
              AND "max_package_width_cm" IS NULL
              AND "max_package_height_cm" IS NULL
            )
            OR
            (
              "max_package_length_cm" IS NOT NULL
              AND "max_package_width_cm" IS NOT NULL
              AND "max_package_height_cm" IS NOT NULL
            )
          )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "planned_routes"
        DROP CONSTRAINT "CHK_planned_routes_package_dimensions",
        DROP CONSTRAINT "CHK_planned_routes_package_height",
        DROP CONSTRAINT "CHK_planned_routes_package_width",
        DROP CONSTRAINT "CHK_planned_routes_package_length",
        DROP CONSTRAINT "CHK_planned_routes_reserved_volume",
        DROP CONSTRAINT "CHK_planned_routes_offered_volume",
        DROP CONSTRAINT "CHK_planned_routes_reserved_weight",
        DROP CONSTRAINT "CHK_planned_routes_offered_weight"
    `);

    await queryRunner.query(`
      ALTER TABLE "planned_routes"
        DROP COLUMN "capacity_notes",
        DROP COLUMN "max_package_height_cm",
        DROP COLUMN "max_package_width_cm",
        DROP COLUMN "max_package_length_cm",
        DROP COLUMN "accepted_cargo_types",
        DROP COLUMN "reserved_volume_m3",
        DROP COLUMN "offered_volume_m3",
        DROP COLUMN "reserved_weight_kg",
        DROP COLUMN "offered_weight_kg"
    `);
  }
}
