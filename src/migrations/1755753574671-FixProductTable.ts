import { MigrationInterface, QueryRunner } from "typeorm";

export class FixProductTable1755753574671 implements MigrationInterface {
    name = 'FixProductTable1755753574671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`fk_news_author\` ON \`news\``);
        await queryRunner.query(`DROP INDEX \`fk_news_category\` ON \`news\``);
        await queryRunner.query(`ALTER TABLE \`address\` CHANGE \`user_id\` \`usersId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`token\` CHANGE \`user_id\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`product_variant\` CHANGE \`product_id\` \`productId\` int NULL`);
        await queryRunner.query(`CREATE TABLE \`category_child\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`parent_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orderId\` varchar(255) NOT NULL, \`gatewayTransactionId\` varchar(255) NULL, \`paymentMethod\` varchar(255) NOT NULL, \`rawData\` json NULL, \`status\` enum ('pending', 'success', 'fail') NOT NULL, \`reason\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_34a006a8dfe9c637c8d0f4fec0\` (\`orderId\`), INDEX \`IDX_e0251495aab5b14693c79edd6b\` (\`gatewayTransactionId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`voucher\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`voucher\` DROP COLUMN \`order_id\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`payment\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`order_item\` DROP COLUMN \`product_id\``);
        await queryRunner.query(`ALTER TABLE \`order_item\` DROP COLUMN \`order_id\``);
        await queryRunner.query(`ALTER TABLE \`order_item\` DROP COLUMN \`productVariant_id\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP COLUMN \`product_id\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP COLUMN \`product_id\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`category_id\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`brand_id\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP COLUMN \`product_id\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP COLUMN \`cart_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`token_id\``);
        await queryRunner.query(`ALTER TABLE \`brand\` ADD \`address\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`brand\` ADD \`phone\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`voucher\` ADD \`usersId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`voucher\` ADD \`orderId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`payment_method\` enum ('stripe', 'momo', 'vnpay', 'bank', 'bank_transfer') NULL`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`payment_status\` enum ('pending', 'success', 'fail') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`payment_amount\` decimal(10,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`payment_description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`transaction_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`gateway_response\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`currency\` varchar(10) NOT NULL DEFAULT 'VND'`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`discount\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`freeship\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`shipping_fee\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`quantity\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`images\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`comment\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`voucher_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order_item\` ADD \`images\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_item\` ADD \`productId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order_item\` ADD \`orderId\` int NULL`);
        
        // Tạm thời disable foreign key checks
        await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0`);
        
        // Xóa dữ liệu không hợp lệ trước khi tạo foreign key constraint
        await queryRunner.query(`DELETE FROM \`order_item\` WHERE \`productId\` IS NOT NULL AND \`productId\` NOT IN (SELECT \`id\` FROM \`product\`)`);
        await queryRunner.query(`DELETE FROM \`order_item\` WHERE \`orderId\` IS NOT NULL AND \`orderId\` NOT IN (SELECT \`id\` FROM \`order\`)`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD \`usersId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD \`productId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD \`usersId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD \`productId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`categoryId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`brandId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`category_childId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD \`productId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD \`cartId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`token\` ADD UNIQUE INDEX \`IDX_94f168faad896c0786646fa3d4\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`order\` CHANGE \`note\` \`note\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_94f168faad896c0786646fa3d4\` ON \`token\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`address\` ADD CONSTRAINT \`FK_cc9b2ed4ab9debaf6cb78bd0330\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`token\` ADD CONSTRAINT \`FK_94f168faad896c0786646fa3d4a\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`category_child\` ADD CONSTRAINT \`FK_58a469b3a3cfdd887a0e1fb6c65\` FOREIGN KEY (\`parent_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`voucher\` ADD CONSTRAINT \`FK_11c6babba3c49d229e56a6f3e70\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`voucher\` ADD CONSTRAINT \`FK_ede99a601dc036467bb80321579\` FOREIGN KEY (\`orderId\`) REFERENCES \`order\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD CONSTRAINT \`FK_199e32a02ddc0f47cd93181d8fd\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD CONSTRAINT \`FK_d6ed6a38cc40cae0c9537c5f0c3\` FOREIGN KEY (\`voucher_id\`) REFERENCES \`voucher\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_item\` ADD CONSTRAINT \`FK_904370c093ceea4369659a3c810\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_item\` ADD CONSTRAINT \`FK_646bf9ece6f45dbe41c203e06e0\` FOREIGN KEY (\`orderId\`) REFERENCES \`order\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_variant\` ADD CONSTRAINT \`FK_6e420052844edf3a5506d863ce6\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_588f0e7159a3cd99b8a7333aa2b\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_1fdf6f092aa907177771948f6a1\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD CONSTRAINT \`FK_ec4c67d98bba94d01c12108b2f9\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD CONSTRAINT \`FK_17e00e49d77ccaf7ff0e14de37b\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_ff0c0301a95e517153df97f6812\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_bb7d3d9dc1fae40293795ae39d6\` FOREIGN KEY (\`brandId\`) REFERENCES \`brand\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_48cfad08aca203c1dcc32cdb595\` FOREIGN KEY (\`category_childId\`) REFERENCES \`category_child\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD CONSTRAINT \`FK_75db0de134fe0f9fe9e4591b7bf\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD CONSTRAINT \`FK_29e590514f9941296f3a2440d39\` FOREIGN KEY (\`cartId\`) REFERENCES \`cart\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // Bật lại foreign key checks
        await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP FOREIGN KEY \`FK_29e590514f9941296f3a2440d39\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP FOREIGN KEY \`FK_75db0de134fe0f9fe9e4591b7bf\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_48cfad08aca203c1dcc32cdb595\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_bb7d3d9dc1fae40293795ae39d6\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_ff0c0301a95e517153df97f6812\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP FOREIGN KEY \`FK_17e00e49d77ccaf7ff0e14de37b\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP FOREIGN KEY \`FK_ec4c67d98bba94d01c12108b2f9\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_1fdf6f092aa907177771948f6a1\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_588f0e7159a3cd99b8a7333aa2b\``);
        await queryRunner.query(`ALTER TABLE \`product_variant\` DROP FOREIGN KEY \`FK_6e420052844edf3a5506d863ce6\``);
        await queryRunner.query(`ALTER TABLE \`order_item\` DROP FOREIGN KEY \`FK_646bf9ece6f45dbe41c203e06e0\``);
        await queryRunner.query(`ALTER TABLE \`order_item\` DROP FOREIGN KEY \`FK_904370c093ceea4369659a3c810\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP FOREIGN KEY \`FK_d6ed6a38cc40cae0c9537c5f0c3\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP FOREIGN KEY \`FK_199e32a02ddc0f47cd93181d8fd\``);
        await queryRunner.query(`ALTER TABLE \`voucher\` DROP FOREIGN KEY \`FK_ede99a601dc036467bb80321579\``);
        await queryRunner.query(`ALTER TABLE \`voucher\` DROP FOREIGN KEY \`FK_11c6babba3c49d229e56a6f3e70\``);
        await queryRunner.query(`ALTER TABLE \`category_child\` DROP FOREIGN KEY \`FK_58a469b3a3cfdd887a0e1fb6c65\``);
        await queryRunner.query(`ALTER TABLE \`token\` DROP FOREIGN KEY \`FK_94f168faad896c0786646fa3d4a\``);
        await queryRunner.query(`ALTER TABLE \`address\` DROP FOREIGN KEY \`FK_cc9b2ed4ab9debaf6cb78bd0330\``);
        await queryRunner.query(`DROP INDEX \`REL_94f168faad896c0786646fa3d4\` ON \`token\``);
        await queryRunner.query(`ALTER TABLE \`order\` CHANGE \`note\` \`note\` varchar(255) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`token\` DROP INDEX \`IDX_94f168faad896c0786646fa3d4\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP COLUMN \`cartId\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP COLUMN \`productId\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`category_childId\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`brandId\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`categoryId\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP COLUMN \`productId\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP COLUMN \`usersId\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP COLUMN \`productId\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP COLUMN \`usersId\``);
        await queryRunner.query(`ALTER TABLE \`order_item\` DROP COLUMN \`orderId\``);
        await queryRunner.query(`ALTER TABLE \`order_item\` DROP COLUMN \`productId\``);
        await queryRunner.query(`ALTER TABLE \`order_item\` DROP COLUMN \`images\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`voucher_id\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`comment\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`images\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`quantity\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`shipping_fee\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`freeship\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`discount\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`currency\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`gateway_response\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`transaction_id\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`payment_description\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`payment_amount\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`payment_status\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`payment_method\``);
        await queryRunner.query(`ALTER TABLE \`voucher\` DROP COLUMN \`orderId\``);
        await queryRunner.query(`ALTER TABLE \`voucher\` DROP COLUMN \`usersId\``);
        await queryRunner.query(`ALTER TABLE \`brand\` DROP COLUMN \`phone\``);
        await queryRunner.query(`ALTER TABLE \`brand\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`token_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD \`cart_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD \`product_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`brand_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`category_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD \`product_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD \`product_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order_item\` ADD \`productVariant_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order_item\` ADD \`order_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order_item\` ADD \`product_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`payment\` varchar(255) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NULL`);
        await queryRunner.query(`ALTER TABLE \`voucher\` ADD \`order_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`voucher\` ADD \`user_id\` int NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_e0251495aab5b14693c79edd6b\` ON \`payment_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_34a006a8dfe9c637c8d0f4fec0\` ON \`payment_logs\``);
        await queryRunner.query(`DROP TABLE \`payment_logs\``);
        await queryRunner.query(`DROP TABLE \`category_child\``);
        await queryRunner.query(`ALTER TABLE \`product_variant\` CHANGE \`productId\` \`product_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`token\` CHANGE \`userId\` \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`address\` CHANGE \`usersId\` \`user_id\` int NULL`);
        await queryRunner.query(`CREATE INDEX \`fk_news_category\` ON \`news\` (\`category_id\`)`);
        await queryRunner.query(`CREATE INDEX \`fk_news_author\` ON \`news\` (\`author_id\`)`);
    }

}
