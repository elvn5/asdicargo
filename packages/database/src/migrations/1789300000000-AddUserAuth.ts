import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Регистрация и вход пользователей сайта: e-mail/пароль и Telegram.
 * Делает telegramId необязательным и добавляет поля e-mail/пароля.
 */
export class AddUserAuth1789300000000 implements MigrationInterface {
  name = 'AddUserAuth1789300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Старый обязательный unique-индекс по telegramId заменяем на частичный.
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_df18d17f84763558ac84192c75"`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "telegramId" DROP NOT NULL`);

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatarUrl" character varying`);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_telegramId" ON "users" ("telegramId") WHERE "telegramId" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email") WHERE "email" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."UQ_users_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."UQ_users_telegramId"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "avatarUrl"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "passwordHash"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "email"`);

    // Восстанавливаем исходный обязательный unique-индекс.
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "telegramId" SET NOT NULL`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_df18d17f84763558ac84192c75" ON "users" ("telegramId")`,
    );
  }
}
