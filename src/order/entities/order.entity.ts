import { AbstractEntity } from 'src/database/database.entity';
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { Users } from 'src/users/entities/users.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
@Entity('order')
export class Order extends AbstractEntity<Order> {

  @Column({ type: 'float', nullable: true })
  price: number;
  @Column({ type: 'float', nullable: true })
  discount?: number;

  @Column({ type: 'float', nullable: true })
  freeship?: number;

  @Column({ type: 'float', nullable: true })
  shipping_fee?: number;

  @Column()
  quantity: number;

  @Column()
  images: string;

  @Column()
  comment: string;

  // Payment fields
  @Column({ type: 'float', nullable: true })
  payment_amount?: number;

  @Column({ nullable: true })
  payment_description?: string;

  @Column({ nullable: true })
  payment_method?: string;

  @Column({ nullable: true })
  payment_status?: string;

  @Column({ nullable: true })
  transaction_id?: string;

  @Column({ nullable: true })
  gateway_response?: string;

  @Column({ nullable: true })
  currency?: string;

  @ManyToOne(() => Users, (users) => users.order)
  users: Users;

  @ManyToOne(() => Voucher, (voucher) => voucher.order, { nullable: true })
  voucher: Voucher;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItem: OrderItem[];
}
