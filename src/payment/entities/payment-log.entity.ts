// payment-log.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
  } from 'typeorm';
  
  @Entity('payment_logs')
  export class PaymentLog {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Index()
    @Column()
    orderId: string;
  
    @Index()
    @Column({ nullable: true })
    gatewayTransactionId: string;
  
    @Column()
    paymentMethod: string;
  
    @Column({ type: 'json', nullable: true })
    rawData: any;
  
    @Column({ type: 'varchar', length: 20 })
    status: 'success' | 'fail' | 'pending';
  
    @Column({ type: 'text', nullable: true })
    reason: string;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  