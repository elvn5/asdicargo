import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Ссылка кнопки «Бесплатная консультация», редактируемая через админку. */
export class AddConsultationUrl1789400000000 implements MigrationInterface {
  name = 'AddConsultationUrl1789400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "support_info" ADD COLUMN IF NOT EXISTS "consultationUrl" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "support_info" DROP COLUMN IF EXISTS "consultationUrl"`);
  }
}
