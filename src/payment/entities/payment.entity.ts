import { AbstractEntity } from 'src/database/database.entity';
import { Order } from 'src/order/entities/order.entity';
import { Users } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

@Entity('payment')
export class Payment extends AbstractEntity<Payment> {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  stripeChargeId: string;

  @Column({ type: 'varchar', length: 100, default: 'stripe' })
  payment_method: string;

  @Column({ type: 'varchar', length: 50, default: 'success' })
  payment_status: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @ManyToOne(() => Order, (order) => order.payment, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Users, (users) => users.payment, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  users: Users;
}
