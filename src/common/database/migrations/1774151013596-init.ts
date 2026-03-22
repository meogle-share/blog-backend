import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1774151013596 implements MigrationInterface {
  name = 'Init1774151013596';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users" (
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL,
                "id" uuid NOT NULL,
                "nickname" character varying NOT NULL,
                "email" character varying,
                CONSTRAINT "UQ_ad02a1be8707004cb805a4b5023" UNIQUE ("nickname"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "password_credentials" (
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL,
                "id" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "email" character varying NOT NULL,
                "hashedPassword" character varying NOT NULL,
                CONSTRAINT "UQ_c5a4d039a102549ca9123e01fbe" UNIQUE ("email"),
                CONSTRAINT "PK_c7302926c19b0b92389e3d3b27a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "oauth_accounts" (
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL,
                "id" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "provider" character varying NOT NULL,
                "providerAccountId" character varying NOT NULL,
                "providerLogin" character varying NOT NULL,
                CONSTRAINT "UQ_oauth_provider_account" UNIQUE ("provider", "providerAccountId"),
                CONSTRAINT "PK_710a81523f515b78f894e33bb10" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "posts" (
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL,
                "id" uuid NOT NULL,
                "title" character varying NOT NULL,
                "content" character varying NOT NULL,
                "authorId" uuid NOT NULL,
                CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "password_credentials"
            ADD CONSTRAINT "FK_71180e99b302619fd5cbd0c275a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "oauth_accounts"
            ADD CONSTRAINT "FK_4c22f13249ce02f89dc6d226e9c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "posts"
            ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "posts" DROP CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e"
        `);
    await queryRunner.query(`
            ALTER TABLE "oauth_accounts" DROP CONSTRAINT "FK_4c22f13249ce02f89dc6d226e9c"
        `);
    await queryRunner.query(`
            ALTER TABLE "password_credentials" DROP CONSTRAINT "FK_71180e99b302619fd5cbd0c275a"
        `);
    await queryRunner.query(`
            DROP TABLE "posts"
        `);
    await queryRunner.query(`
            DROP TABLE "oauth_accounts"
        `);
    await queryRunner.query(`
            DROP TABLE "password_credentials"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
  }
}
