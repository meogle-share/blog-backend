import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1762523612796 implements MigrationInterface {
    name = 'Migration1762523612796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL,
                "username" character varying NOT NULL,
                "password" character varying NOT NULL,
                "nickname" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "posts" (
                "id" uuid NOT NULL,
                "title" character varying NOT NULL,
                "content" character varying NOT NULL,
                "authorId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "boards" (
                "id" SERIAL NOT NULL,
                "slug" character varying NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "UQ_9a01141982175d5633687bcb47d" UNIQUE ("slug"),
                CONSTRAINT "PK_606923b0b068ef262dfdcd18f44" PRIMARY KEY ("id")
            )
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
            DROP TABLE "boards"
        `);
        await queryRunner.query(`
            DROP TABLE "posts"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
    }

}
