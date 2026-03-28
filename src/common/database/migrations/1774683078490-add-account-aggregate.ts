import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountAggregate1774683078490 implements MigrationInterface {
  name = 'AddAccountAggregate1774683078490';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. accounts 테이블 생성
    await queryRunner.query(`
            CREATE TABLE "accounts" (
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL,
                "id" uuid NOT NULL,
                CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")
            )
        `);

    // 2. 기존 데이터 마이그레이션: userId 기반으로 accounts 레코드 생성
    await queryRunner.query(`
            INSERT INTO "accounts" ("id", "createdAt", "updatedAt")
            SELECT DISTINCT "userId", NOW(), NOW()
            FROM (
                SELECT "userId" FROM "oauth_accounts"
                UNION
                SELECT "userId" FROM "password_credentials"
            ) AS credential_users
        `);

    // 3. FK 제거 후 컬럼명 변경
    await queryRunner.query(`
            ALTER TABLE "oauth_accounts" DROP CONSTRAINT "FK_4c22f13249ce02f89dc6d226e9c"
        `);
    await queryRunner.query(`
            ALTER TABLE "password_credentials" DROP CONSTRAINT "FK_71180e99b302619fd5cbd0c275a"
        `);
    await queryRunner.query(`
            ALTER TABLE "oauth_accounts"
                RENAME COLUMN "userId" TO "accountId"
        `);
    await queryRunner.query(`
            ALTER TABLE "password_credentials"
                RENAME COLUMN "userId" TO "accountId"
        `);

    // 4. users 테이블에 accountId 추가 (nullable로 먼저 추가)
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "accountId" uuid
        `);

    // 5. 기존 users의 accountId를 채움 (user.id = account.id인 경우)
    await queryRunner.query(`
            UPDATE "users" SET "accountId" = "id"
            WHERE "id" IN (SELECT "id" FROM "accounts")
        `);

    // 6. NOT NULL 제약 추가
    await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "accountId" SET NOT NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_42bba679e348de51a699fb0a803" UNIQUE ("accountId")
        `);

    // 7. 새 FK 추가
    await queryRunner.query(`
            ALTER TABLE "oauth_accounts"
            ADD CONSTRAINT "FK_457e9bd0c52d9b209769a241748" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "password_credentials"
            ADD CONSTRAINT "FK_3308f5de8b2bd73b8019006ddd0" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "password_credentials" DROP CONSTRAINT "FK_3308f5de8b2bd73b8019006ddd0"
        `);
    await queryRunner.query(`
            ALTER TABLE "oauth_accounts" DROP CONSTRAINT "FK_457e9bd0c52d9b209769a241748"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_42bba679e348de51a699fb0a803"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "accountId"
        `);
    await queryRunner.query(`
            DROP TABLE "accounts"
        `);
    await queryRunner.query(`
            ALTER TABLE "password_credentials"
                RENAME COLUMN "accountId" TO "userId"
        `);
    await queryRunner.query(`
            ALTER TABLE "oauth_accounts"
                RENAME COLUMN "accountId" TO "userId"
        `);
    await queryRunner.query(`
            ALTER TABLE "password_credentials"
            ADD CONSTRAINT "FK_71180e99b302619fd5cbd0c275a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "oauth_accounts"
            ADD CONSTRAINT "FK_4c22f13249ce02f89dc6d226e9c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }
}
