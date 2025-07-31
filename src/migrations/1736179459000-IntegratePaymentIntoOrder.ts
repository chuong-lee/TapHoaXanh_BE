import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class IntegratePaymentIntoOrder1736179459000 implements MigrationInterface {
  name = 'IntegratePaymentIntoOrder1736179459000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add payment columns to order table
    await queryRunner.addColumns('order', [
      new TableColumn({
        name: 'payment_amount',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
      new TableColumn({
        name: 'currency',
        type: 'varchar',
        length: '3',
        default: "'VND'",
      }),
      new TableColumn({
        name: 'payment_source',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'payment_description',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'payment_method',
        type: 'enum',
        enum: ['stripe', 'momo', 'vnpay', 'bank', 'bank_transfer'],
        isNullable: true,
      }),
      new TableColumn({
        name: 'payment_status',
        type: 'enum',
        enum: ['pending', 'success', 'fail'],
        default: "'pending'",
      }),
      new TableColumn({
        name: 'transaction_id',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'gateway_response',
        type: 'text',
        isNullable: true,
      }),
    ]);

    // Migrate data from payment table to order table (if needed)
    // This step would require custom logic based on your data structure
    
    // Drop foreign key constraint from order to payment
    // await queryRunner.dropForeignKey('order', 'FK_order_payment');
    
    // Drop payment_id column from order table
    // await queryRunner.dropColumn('order', 'payment_id');
    
    // Drop payment table
    // await queryRunner.dropTable('payment');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate payment table
    await queryRunner.query(`
      CREATE TABLE payment (
        id int PRIMARY KEY AUTO_INCREMENT,
        amount decimal(10,2) NOT NULL,
        currency varchar(3) DEFAULT 'VND',
        source varchar(255),
        description text,
        payment_method enum('stripe','momo','vnpay','bank','bank_transfer'),
        payment_status enum('pending','success','fail') DEFAULT 'pending',
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add payment_id column back to order table
    await queryRunner.addColumn('order', new TableColumn({
      name: 'payment_id',
      type: 'int',
      isNullable: true,
    }));

    // Drop payment columns from order table
    await queryRunner.dropColumns('order', [
      'payment_amount',
      'currency', 
      'payment_source',
      'payment_description',
      'payment_method',
      'payment_status',
      'transaction_id',
      'gateway_response'
    ]);
  }
}
