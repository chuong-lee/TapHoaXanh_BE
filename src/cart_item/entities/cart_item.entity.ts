import { ProductVariant } from 'src/product-variant/entities/product-variant.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Cart } from '../../cart/entities/cart.entity';
import { AbstractEntity } from '../../database/database.entity';

@Entity('cart_item')
export class CartItem extends AbstractEntity<CartItem> {
  constructor(cart: Cart, quantity: number, price: number, product_variant: ProductVariant) {
    super();
    this.cart = cart;
    this.quantity = quantity;
    this.price = price;
    this.product_variant = product_variant;
  }
  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column()
  total_price?: number;

  @Column()
  price!: number;

  @ManyToOne(() => ProductVariant, (product_variant) => product_variant.cartItems)
  @JoinColumn({ name: 'product_variant_id' })
  product_variant!: ProductVariant;

  @ManyToOne(() => Cart, (cart) => cart.cartItems)
  @JoinColumn({ name: 'cart_id' })
  cart!: Cart;
}
