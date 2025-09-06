import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  order_id!: number;

  @Column()
  transaction_id!: string;

  @Column()
  amount!: number;

  @Column()
  status!: string;

  @Column({ nullable: true })
  payment_method?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  gateway_response?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order?: Order;
}

