import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWardToAddress1756180262000 implements MigrationInterface {
    name = 'AddWardToAddress1756180262000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`address\` ADD \`ward\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`address\` DROP COLUMN \`ward\``);
    }
}

