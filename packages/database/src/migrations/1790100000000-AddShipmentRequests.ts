import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Личный кабинет (этап 2):
 * - адреса компании получают тип, город, телефон, часы работы и координаты
 *   (пункты выдачи на карте). Существующие записи — склады приёма;
 * - адресная книга клиента (user_addresses);
 * - заявки на перевозку (shipment_requests) с привязкой к посылке.
 */
export class AddShipmentRequests1790100000000 implements MigrationInterface {
  name = 'AddShipmentRequests1790100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Адреса компании ---
    await queryRunner.query(
      `CREATE TYPE "public"."addresses_kind_enum" AS ENUM('warehouse', 'pickup', 'office')`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "kind" "public"."addresses_kind_enum" NOT NULL DEFAULT 'pickup'`,
    );
    await queryRunner.query(`UPDATE "addresses" SET "kind" = 'warehouse'`);
    await queryRunner.query(`ALTER TABLE "addresses" ADD "city" character varying`);
    await queryRunner.query(`ALTER TABLE "addresses" ADD "phone" character varying`);
    await queryRunner.query(`ALTER TABLE "addresses" ADD "workingHours" character varying`);
    await queryRunner.query(`ALTER TABLE "addresses" ADD "latitude" double precision`);
    await queryRunner.query(`ALTER TABLE "addresses" ADD "longitude" double precision`);

    // --- Адресная книга ---
    await queryRunner.query(
      `CREATE TABLE "user_addresses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "label" character varying NOT NULL,
        "contactName" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "city" character varying NOT NULL,
        "address" text NOT NULL,
        "comment" text,
        "isDefault" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_addresses_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_addresses_userId" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_addresses_userId" ON "user_addresses" ("userId")`,
    );

    // --- Заявки на перевозку ---
    await queryRunner.query(
      `CREATE TYPE "public"."shipment_requests_direction_enum" AS ENUM('kg_ru', 'ru_kg')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shipment_requests_status_enum" AS ENUM('new', 'in_progress', 'completed', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shipment_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "number" SERIAL NOT NULL,
        "userId" uuid NOT NULL,
        "direction" "public"."shipment_requests_direction_enum" NOT NULL,
        "fromCity" character varying NOT NULL,
        "toCity" character varying NOT NULL,
        "cargoDescription" text NOT NULL,
        "weightKg" numeric(10,2) NOT NULL,
        "volumeM3" numeric(10,3),
        "estimatedCostSom" integer NOT NULL,
        "pickupRequired" boolean NOT NULL DEFAULT false,
        "pickupAddress" text,
        "recipientName" character varying NOT NULL,
        "recipientPhone" character varying NOT NULL,
        "recipientAddress" text NOT NULL,
        "comment" text,
        "status" "public"."shipment_requests_status_enum" NOT NULL DEFAULT 'new',
        "managerComment" text,
        "parcelId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_shipment_requests_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_shipment_requests_userId" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_shipment_requests_parcelId" FOREIGN KEY ("parcelId")
          REFERENCES "parcels"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )`,
    );
    // Номера заявок начинаем с 1001 — выглядит солиднее, чем «№ 1».
    await queryRunner.query(`ALTER SEQUENCE "shipment_requests_number_seq" RESTART WITH 1001`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_shipment_requests_number" ON "shipment_requests" ("number")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_shipment_requests_userId" ON "shipment_requests" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_shipment_requests_userId"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_shipment_requests_number"`);
    await queryRunner.query(`DROP TABLE "shipment_requests"`);
    await queryRunner.query(`DROP TYPE "public"."shipment_requests_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."shipment_requests_direction_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_addresses_userId"`);
    await queryRunner.query(`DROP TABLE "user_addresses"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "longitude"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "latitude"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "workingHours"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "kind"`);
    await queryRunner.query(`DROP TYPE "public"."addresses_kind_enum"`);
  }
}
