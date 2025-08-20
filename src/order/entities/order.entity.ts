
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
  note?: string;

  @Column()
  order_code!: string;

  @Column()
  status!: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment?: PaymentMethod;

  @ManyToOne(() => Users, (user) => user.order)
  user!: Users;

  @OneToMany(() => Voucher, (voucher) => voucher.order)
  voucher?: Voucher[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItem!: OrderItem[];
}
