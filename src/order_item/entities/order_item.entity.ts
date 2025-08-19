import { AbstractEntity } from '../../database/database.entity';
import { Order } from '../../order/entities/order.entity';
import { ProductVariant } from '../../product-variant/entities/product-variant.entity';
import { Product } from '../../products/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('order_item')
export class OrderItem extends AbstractEntity<OrderItem> {
  @Column()
  quantity!: number;

  @Column()
  unit_price!: number;

  @ManyToOne(() => Product, (product) => product.orderItem)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Order, (order) => order.orderItem)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @ManyToOne(() => ProductVariant, (productVariant) => productVariant.orderItem)
  @JoinColumn({ name: 'productVariant_id' })
  productVariant!: ProductVariant;
}
