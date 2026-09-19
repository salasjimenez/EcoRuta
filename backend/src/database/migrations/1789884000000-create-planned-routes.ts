import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlannedRoutes1789884000000 implements MigrationInterface {
  name = 'CreatePlannedRoutes1789884000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "route_status_enum" AS ENUM (
        'planned',
        'in_progress',
        'completed',
        'cancelled'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "planned_routes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "owner_id" uuid NOT NULL,
        "vehicle_id" uuid NOT NULL,
        "origin_city" character varying(100) NOT NULL,
        "origin_address" character varying(180),
        "origin_latitude" double precision NOT NULL,
        "origin_longitude" double precision NOT NULL,
        "destination_city" character varying(100) NOT NULL,
        "destination_address" character varying(180),
        "destination_latitude" double precision NOT NULL,
        "destination_longitude" double precision NOT NULL,
        "departure_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "estimated_arrival_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "estimated_distance_km" double precision NOT NULL,
        "status" "route_status_enum" NOT NULL DEFAULT 'planned',
        "notes" character varying(500),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_planned_routes_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_planned_routes_owner" FOREIGN KEY ("owner_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_planned_routes_vehicle" FOREIGN KEY ("vehicle_id")
          REFERENCES "vehicles"("id") ON DELETE RESTRICT,
        CONSTRAINT "CHK_planned_routes_origin_latitude"
          CHECK ("origin_latitude" BETWEEN -90 AND 90),
        CONSTRAINT "CHK_planned_routes_origin_longitude"
          CHECK ("origin_longitude" BETWEEN -180 AND 180),
        CONSTRAINT "CHK_planned_routes_destination_latitude"
          CHECK ("destination_latitude" BETWEEN -90 AND 90),
        CONSTRAINT "CHK_planned_routes_destination_longitude"
          CHECK ("destination_longitude" BETWEEN -180 AND 180),
        CONSTRAINT "CHK_planned_routes_distance"
          CHECK ("estimated_distance_km" > 0),
        CONSTRAINT "CHK_planned_routes_schedule"
          CHECK ("estimated_arrival_at" > "departure_at"),
        CONSTRAINT "CHK_planned_routes_different_points"
          CHECK (
            "origin_latitude" <> "destination_latitude"
            OR "origin_longitude" <> "destination_longitude"
          )
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_planned_routes_owner_id" ON "planned_routes" ("owner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planned_routes_vehicle_id" ON "planned_routes" ("vehicle_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planned_routes_departure_at" ON "planned_routes" ("departure_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planned_routes_status" ON "planned_routes" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_planned_routes_status"`);
    await queryRunner.query(`DROP INDEX "IDX_planned_routes_departure_at"`);
    await queryRunner.query(`DROP INDEX "IDX_planned_routes_vehicle_id"`);
    await queryRunner.query(`DROP INDEX "IDX_planned_routes_owner_id"`);
    await queryRunner.query(`DROP TABLE "planned_routes"`);
    await queryRunner.query(`DROP TYPE "route_status_enum"`);
  }
}
