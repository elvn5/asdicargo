import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Личный кабинет (этап 3): обращения с перепиской, заказ документов
 * (файл хранится в bytea) и уведомления в кабинете.
 */
export class AddAccountServices1790200000000 implements MigrationInterface {
  name = 'AddAccountServices1790200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Обращения ---
    await queryRunner.query(
      `CREATE TYPE "public"."appeals_category_enum" AS ENUM('damage', 'loss', 'delay', 'payment', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."appeals_status_enum" AS ENUM('open', 'answered', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "appeals" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "number" SERIAL NOT NULL,
        "userId" uuid NOT NULL,
        "parcelId" uuid,
        "category" "public"."appeals_category_enum" NOT NULL,
        "subject" character varying NOT NULL,
        "status" "public"."appeals_status_enum" NOT NULL DEFAULT 'open',
        "lastMessageAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_appeals_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_appeals_userId" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_appeals_parcelId" FOREIGN KEY ("parcelId")
          REFERENCES "parcels"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(`ALTER SEQUENCE "appeals_number_seq" RESTART WITH 1001`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_appeals_number" ON "appeals" ("number")`);
    await queryRunner.query(`CREATE INDEX "IDX_appeals_userId" ON "appeals" ("userId")`);

    await queryRunner.query(
      `CREATE TYPE "public"."appeal_messages_author_enum" AS ENUM('client', 'manager')`,
    );
    await queryRunner.query(
      `CREATE TABLE "appeal_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "appealId" uuid NOT NULL,
        "author" "public"."appeal_messages_author_enum" NOT NULL,
        "body" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_appeal_messages_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_appeal_messages_appealId" FOREIGN KEY ("appealId")
          REFERENCES "appeals"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_appeal_messages_appealId" ON "appeal_messages" ("appealId")`,
    );

    // --- Документы ---
    await queryRunner.query(
      `CREATE TYPE "public"."document_requests_type_enum" AS ENUM('invoice', 'reconciliation', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."document_requests_status_enum" AS ENUM('pending', 'ready', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "document_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "number" SERIAL NOT NULL,
        "userId" uuid NOT NULL,
        "type" "public"."document_requests_type_enum" NOT NULL,
        "periodFrom" date,
        "periodTo" date,
        "comment" text,
        "status" "public"."document_requests_status_enum" NOT NULL DEFAULT 'pending',
        "managerComment" text,
        "fileName" character varying,
        "fileMime" character varying,
        "fileSize" integer,
        "fileData" bytea,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_document_requests_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_document_requests_userId" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(`ALTER SEQUENCE "document_requests_number_seq" RESTART WITH 1001`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_document_requests_number" ON "document_requests" ("number")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_document_requests_userId" ON "document_requests" ("userId")`,
    );

    // --- Уведомления ---
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('parcel_status', 'request_status', 'request_reply', 'appeal_reply', 'document_ready', 'document_rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" "public"."notifications_type_enum" NOT NULL,
        "params" jsonb NOT NULL DEFAULT '{}',
        "link" character varying,
        "readAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_userId" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_userId_createdAt" ON "notifications" ("userId", "createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_notifications_userId_createdAt"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_document_requests_userId"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_document_requests_number"`);
    await queryRunner.query(`DROP TABLE "document_requests"`);
    await queryRunner.query(`DROP TYPE "public"."document_requests_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."document_requests_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_appeal_messages_appealId"`);
    await queryRunner.query(`DROP TABLE "appeal_messages"`);
    await queryRunner.query(`DROP TYPE "public"."appeal_messages_author_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_appeals_userId"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_appeals_number"`);
    await queryRunner.query(`DROP TABLE "appeals"`);
    await queryRunner.query(`DROP TYPE "public"."appeals_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."appeals_category_enum"`);
  }
}
