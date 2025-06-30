import { AbstractEntity } from 'src/database/database.entity';
import { Order } from 'src/order/entities/order.entity';
import { Users } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('voucher')
export class Voucher extends AbstractEntity<Voucher> {
  @Column()
  code: string;

  @Column()
  max_discount: number;

  @Column()
  min_order_value: number;

  @Column()
  quantity: number;

  @Column()
  is_used: boolean;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @ManyToOne(() => Users, (users) => users.voucher)
  users: Users;
  @ManyToOne(() => Order, (order) => order.voucher)
  order: Order;
}
