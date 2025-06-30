import { AbstractEntity } from 'src/database/database.entity';
import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('order_item')
export class OrderItem extends AbstractEntity<OrderItem> {
  @Column()
  quantity: number;

  @Column()
  images: string;

  @Column()
  unit_price: number;

  @ManyToOne(() => Product, (product) => product.orderItem)
  product: Product;

  @ManyToOne(() => Order, (order) => order.orderItem)
  order: Order;
}
