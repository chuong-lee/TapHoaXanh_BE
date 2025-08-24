import { AbstractEntity } from '../../database/database.entity';
import { OrderItem } from '../../order_item/entities/order_item.entity';
import { Users } from '../../users/entities/users.entity';
import { Voucher } from '../../voucher/entities/voucher.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

@Entity('order')
export class Order extends AbstractEntity<Order> {
  @Column()
  total_price: number = 0;

  @Column({ nullable: true })
  note?: string;

  @Column()
  order_code: string = '';

  @Column()
  status: string = '';

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  payment_method?: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus = PaymentStatus.PENDING;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  payment_amount?: number;

  @Column({ type: 'text', nullable: true })
  payment_description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_id?: string;

  @Column({ type: 'text', nullable: true })
  gateway_response?: string;

  @Column({ type: 'varchar', length: 10, default: 'VND' })
  currency: string = 'VND';

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  freeship: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shipping_fee: number = 0;

  @Column({ type: 'int', default: 1 })
  quantity: number = 1;

  @Column({ type: 'text', nullable: true })
  images?: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ManyToOne(() => Users, (user) => user.order)
  @JoinColumn({ name: 'user_id' })
  user!: Users;

  @ManyToOne(() => Voucher, (voucher) => voucher.order, { nullable: true })
  @JoinColumn({ name: 'voucher_id' })
  voucher?: Voucher;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItem!: OrderItem[];
}
