import { AbstractEntity } from '../../database/database.entity';
import { Order } from '../../order/entities/order.entity';
import { Users } from '../../users/entities/users.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

@Entity('voucher')
export class Voucher extends AbstractEntity<Voucher> {
  @Column()
  code!: string;

  @Column()
  max_discount!: number;

  @Column()
  min_order_value!: number;

  @Column()
  quantity!: number;

  @Column()
  is_used!: boolean;

  @Column()
  start_date!: Date;

  @Column()
  end_date!: Date;

  @ManyToOne(() => Users, (users) => users.voucher)
  @JoinColumn({ name: 'user_id' })
  users!: Users;

  @ManyToOne(() => Order, (order) => order.voucher)
  @JoinColumn({ name: 'order_id' })
  order!: Order;
}
