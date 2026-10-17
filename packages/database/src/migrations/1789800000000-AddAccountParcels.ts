import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Личный кабинет клиента (этап 1):
 * - объём и стоимость посылки, которые заполняет менеджер;
 * - история статусов посылки для таймлайна в кабинете.
 * Существующим посылкам заводим стартовую запись истории с текущим статусом.
 */
export class AddAccountParcels1789800000000 implements MigrationInterface {
  name = 'AddAccountParcels1789800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "parcels" ADD "volumeM3" character varying`);
    await queryRunner.query(`ALTER TABLE "parcels" ADD "costSom" character varying`);

    await queryRunner.query(
      `CREATE TABLE "parcel_status_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "parcelId" uuid NOT NULL,
        "status" "public"."parcels_status_enum" NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_parcel_status_history_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_parcel_status_history_parcelId" FOREIGN KEY ("parcelId")
          REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_parcel_status_history_parcelId" ON "parcel_status_history" ("parcelId")`,
    );

    await queryRunner.query(
      `INSERT INTO "parcel_status_history" ("parcelId", "status", "createdAt")
       SELECT "id", "status", "updatedAt" FROM "parcels"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_parcel_status_history_parcelId"`);
    await queryRunner.query(`DROP TABLE "parcel_status_history"`);
    await queryRunner.query(`ALTER TABLE "parcels" DROP COLUMN "costSom"`);
    await queryRunner.query(`ALTER TABLE "parcels" DROP COLUMN "volumeM3"`);
  }
}
