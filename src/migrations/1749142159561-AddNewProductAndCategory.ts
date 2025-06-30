import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewProductAndCategory1749142159561 implements MigrationInterface {
    name = 'AddNewProductAndCategory1749142159561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`name\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`parent_id\` int NOT NULL, \`description\` varchar(255) NULL, \`is_active\` tinyint NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`name\` varchar(255) NOT NULL, \`price\` int NOT NULL, \`discount\` int NOT NULL, \`images\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`barcode\` varchar(255) NOT NULL, \`expiry_date\` datetime NOT NULL, \`origin\` varchar(255) NOT NULL, \`weight_unit\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`quantity\` int NOT NULL, \`categoryId\` int NULL, UNIQUE INDEX \`IDX_7ac18742b02b8af41afdaa3b9a\` (\`barcode\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_ff0c0301a95e517153df97f6812\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_ff0c0301a95e517153df97f6812\``);
        await queryRunner.query(`DROP INDEX \`IDX_7ac18742b02b8af41afdaa3b9a\` ON \`product\``);
        await queryRunner.query(`DROP TABLE \`product\``);
        await queryRunner.query(`DROP TABLE \`category\``);
    }

}
