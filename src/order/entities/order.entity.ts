import { AbstractEntity } from 'src/database/database.entity';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Rating } from 'src/rating/entities/rating.entity';
import { Users } from 'src/users/entities/users.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';
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

  @ManyToOne(() => Users, (users) => users.order)
  users: Users;

  @OneToMany(() => Voucher, (voucher) => voucher.order)
  voucher: Voucher[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payment: Payment[];

  @OneToMany(() => Delivery, (delivery) => delivery.order)
  delivery: Delivery[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItem: OrderItem[];

  @OneToMany(() => Rating, (rating) => rating.order)
  rating: Rating[];
}
