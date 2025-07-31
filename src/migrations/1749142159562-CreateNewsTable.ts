import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNewsTable1749142159562 implements MigrationInterface {
  name = 'CreateNewsTable1749142159562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`news\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deletedAt\` datetime(6) NULL,
                \`name\` varchar(255) NOT NULL,
                \`summary\` text NULL,
                \`images\` text NULL,
                \`description\` text NOT NULL,
                \`views\` int NOT NULL DEFAULT '0',
                \`likes\` int NOT NULL DEFAULT '0',
                \`comments_count\` int NOT NULL DEFAULT '0',
                \`author_id\` int NULL,
                \`category_id\` int NULL,
                \`type\` varchar(50) NULL,
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_news_author_id\` (\`author_id\`),
                INDEX \`IDX_news_category_id\` (\`category_id\`),
                INDEX \`IDX_news_type\` (\`type\`),
                INDEX \`IDX_news_created_at\` (\`createdAt\`)
            ) ENGINE=InnoDB
        `);

    await queryRunner.query(`
            ALTER TABLE \`news\` 
            ADD CONSTRAINT \`FK_news_author_id\` 
            FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) 
            ON DELETE SET NULL ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE \`news\` 
            ADD CONSTRAINT \`FK_news_category_id\` 
            FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) 
            ON DELETE SET NULL ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`news\` DROP FOREIGN KEY \`FK_news_category_id\``);
    await queryRunner.query(`ALTER TABLE \`news\` DROP FOREIGN KEY \`FK_news_author_id\``);
    await queryRunner.query(`DROP INDEX \`IDX_news_created_at\` ON \`news\``);
    await queryRunner.query(`DROP INDEX \`IDX_news_type\` ON \`news\``);
    await queryRunner.query(`DROP INDEX \`IDX_news_category_id\` ON \`news\``);
    await queryRunner.query(`DROP INDEX \`IDX_news_author_id\` ON \`news\``);
    await queryRunner.query(`DROP TABLE \`news\``);
  }
}
