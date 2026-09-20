import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShippingRequests1790056800000
  implements MigrationInterface
{
  name = 'CreateShippingRequests1790056800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "shipping_request_status_enum"
      AS ENUM ('open', 'cancelled')
    `);

    await queryRunner.query(`
      CREATE TABLE "shipping_requests" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "company_id" uuid NOT NULL,
        "origin_city" character varying(100) NOT NULL,
        "origin_address" character varying(180),
        "origin_latitude" double precision NOT NULL,
        "origin_longitude" double precision NOT NULL,
        "destination_city" character varying(100) NOT NULL,
        "destination_address" character varying(180),
        "destination_latitude" double precision NOT NULL,
        "destination_longitude" double precision NOT NULL,
        "pickup_window_start" TIMESTAMP WITH TIME ZONE NOT NULL,
        "pickup_window_end" TIMESTAMP WITH TIME ZONE NOT NULL,
        "delivery_window_start" TIMESTAMP WITH TIME ZONE NOT NULL,
        "delivery_window_end" TIMESTAMP WITH TIME ZONE NOT NULL,
        "cargo_type" "cargo_type_enum" NOT NULL,
        "cargo_description" character varying(300) NOT NULL,
        "weight_kg" double precision NOT NULL,
        "volume_m3" double precision NOT NULL,
        "package_length_cm" double precision,
        "package_width_cm" double precision,
        "package_height_cm" double precision,
        "special_requirements" character varying(500),
        "status" "shipping_request_status_enum" NOT NULL DEFAULT 'open',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_shipping_requests" PRIMARY KEY ("id"),
        CONSTRAINT "FK_shipping_requests_company"
          FOREIGN KEY ("company_id") REFERENCES "users"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "CHK_shipping_requests_weight"
          CHECK ("weight_kg" > 0),
        CONSTRAINT "CHK_shipping_requests_volume"
          CHECK ("volume_m3" > 0),
        CONSTRAINT "CHK_shipping_requests_pickup_window"
          CHECK ("pickup_window_start" < "pickup_window_end"),
        CONSTRAINT "CHK_shipping_requests_delivery_window"
          CHECK ("delivery_window_start" < "delivery_window_end"),
        CONSTRAINT "CHK_shipping_requests_time_sequence"
          CHECK ("pickup_window_start" < "delivery_window_end"),
        CONSTRAINT "CHK_shipping_requests_package_length"
          CHECK ("package_length_cm" IS NULL OR "package_length_cm" > 0),
        CONSTRAINT "CHK_shipping_requests_package_width"
          CHECK ("package_width_cm" IS NULL OR "package_width_cm" > 0),
        CONSTRAINT "CHK_shipping_requests_package_height"
          CHECK ("package_height_cm" IS NULL OR "package_height_cm" > 0),
        CONSTRAINT "CHK_shipping_requests_package_dimensions"
          CHECK (
            (
              "package_length_cm" IS NULL
              AND "package_width_cm" IS NULL
              AND "package_height_cm" IS NULL
            )
            OR
            (
              "package_length_cm" IS NOT NULL
              AND "package_width_cm" IS NOT NULL
              AND "package_height_cm" IS NOT NULL
            )
          )
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_shipping_requests_company_id"
      ON "shipping_requests" ("company_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_shipping_requests_status"
      ON "shipping_requests" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_shipping_requests_pickup_window_start"
      ON "shipping_requests" ("pickup_window_start")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_shipping_requests_origin_destination"
      ON "shipping_requests" ("origin_city", "destination_city")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."IDX_shipping_requests_origin_destination"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_shipping_requests_pickup_window_start"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_shipping_requests_status"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_shipping_requests_company_id"
    `);
    await queryRunner.query(`DROP TABLE "shipping_requests"`);
    await queryRunner.query(`DROP TYPE "shipping_request_status_enum"`);
  }
}
