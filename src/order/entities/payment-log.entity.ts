// payment-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';

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

  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
