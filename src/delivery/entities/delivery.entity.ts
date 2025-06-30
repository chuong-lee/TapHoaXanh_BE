import { AbstractEntity } from 'src/database/database.entity';
import { Order } from 'src/order/entities/order.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('delivery')
export class Delivery extends AbstractEntity<Delivery> {
  @Column()
  tracking_number: string;

  @Column()
  status: string;

  @Column()
  notes: string;

  @Column()
  estimated_date: Date;

  @Column()
  shipped_at: Date;

  @Column()
  delivered_at: Date;

  @Column()
  delivery_fee: number;
  @ManyToOne(() => Order, (order) => order.delivery)
  order: Order;
}
