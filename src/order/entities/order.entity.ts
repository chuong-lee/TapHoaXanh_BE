import { AbstractEntity } from 'src/database/database.entity';
import { Users } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { PaymentMethod } from '../enums/payment-method.enum';
import { Voucher } from 'src/voucher/entities/voucher.entity';
import { OrderItem } from 'src/order_item/entities/order_item.entity';

@Entity('order')
export class Order extends AbstractEntity<Order> {
  @Column()
  total_price!: number;

  @Column()
  note?: string;

  @Column()
  order_code!: string;

  @Column()
  status!: string;

  @Column()
  comment?: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment?: PaymentMethod;

  @ManyToOne(() => Users, (user) => user.order)
  user!: Users;

  @OneToMany(() => Voucher, (voucher) => voucher.order)
  voucher?: Voucher[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItem!: OrderItem[];
}
