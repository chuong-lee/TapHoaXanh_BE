import { AbstractEntity } from 'src/database/database.entity';
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { Rating } from 'src/rating/entities/rating.entity';
import { Users } from 'src/users/entities/users.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('order')
export class Order extends AbstractEntity<Order> {
  @Column()
  price: number;

  @Column()
  quantity: number;

  @Column()
  images: string;

  @Column()
  comment: string;

  // Payment fields integrated into Order
  @Column({ nullable: true })
  payment_amount?: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ nullable: true })
  payment_source?: string;

  @Column({ nullable: true })
  payment_description?: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  payment_method?: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @Column({ nullable: true })
  transaction_id?: string;

  @Column({ nullable: true })
  gateway_response?: string;

  @ManyToOne(() => Users, (users) => users.order)
  users: Users;

  @OneToMany(() => Voucher, (voucher) => voucher.order)
  voucher: Voucher[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItem: OrderItem[];

  @OneToMany(() => Rating, (rating) => rating.order)
  rating: Rating[];
}
