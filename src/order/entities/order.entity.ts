import { AbstractEntity } from '../../database/database.entity';
import { OrderItem } from '../../order_item/entities/order_item.entity';
import { Users } from '../../users/entities/users.entity';
import { Voucher } from '../../voucher/entities/voucher.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('order')
export class Order extends AbstractEntity<Order> {
  @Column()
  total_price!: number;

  @Column()
  note?: number;

  @Column()
  order_code!: string;

  @Column()
  status!: string;

  @Column()
  comment?: string;

  @Column()
  payment_method!: string;

  // Payment fields
  @Column({ type: 'float', nullable: true })
  payment_amount?: number;

  @Column({ nullable: true })
  payment_description?: string;

  @Column({ nullable: true })
  payment_status?: string;

  @Column({ nullable: true })
  transaction_id?: string;

  @Column({ nullable: true })
  gateway_response?: string;

  @Column({ nullable: true })
  currency?: string;

  @ManyToOne(() => Users, (users) => users.order)
  @JoinColumn({ name: 'user_id' })
  users!: Users;

  @OneToMany(() => Voucher, (voucher) => voucher.order)
  voucher?: Voucher[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItem!: OrderItem[];
}
