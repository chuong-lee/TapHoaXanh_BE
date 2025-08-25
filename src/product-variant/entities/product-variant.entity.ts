import { CartItem } from 'src/cart_item/entities/cart_item.entity';
import { AbstractEntity } from '../../database/database.entity';
import { OrderItem } from '../../order_item/entities/order_item.entity';
import { Product } from '../../products/entities/product.entity';
import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('product_variant')
export class ProductVariant extends AbstractEntity<ProductVariant> {
  @Column()
  variant_name!: string;

  @Column()
  image_url!: string;

  @Column()
  price_modifier!: number;

  @Column()
  stock!: number;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.productVariant)
  orderItem!: OrderItem[];

  @OneToMany(() => CartItem, (item) => item.product_variant)
  cartItems!: CartItem[];
}
