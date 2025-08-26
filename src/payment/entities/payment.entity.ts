import { AbstractEntity } from '../../database/database.entity';
import { Order } from '../../order/entities/order.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('payments')
export class Payment extends AbstractEntity<Payment> {
  @Column()
  payment_method?: string;

  @Column()
  status?: string;

  @Column()
  amount?: number; // vnp_Amount (số tiền thanh toán)

  @Column({ nullable: true })
  txn_ref?: string; // vnp_TxnRef

  @ManyToOne(() => Order, (order) => order.payments)
  @JoinColumn({ name: 'order_id' })
  order!: Order;
}
