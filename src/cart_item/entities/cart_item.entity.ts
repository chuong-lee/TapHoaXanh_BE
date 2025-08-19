import { Cart } from 'src/cart/entities/cart.entity';
import { AbstractEntity } from 'src/database/database.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('cart_item')
export class CartItem extends AbstractEntity<CartItem> {
  constructor(cart: Cart, quantity: number, price: number, product: Product) {
    super();
    this.cart = cart;
    this.quantity = quantity;
    this.price = price;
    this.product = product;
  }
  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column()
  total_price?: number;

  @Column()
  price!: number;

  @ManyToOne(() => Product, (product) => product.cartItems)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Cart, (cart) => cart.cartItems)
  @JoinColumn({ name: 'cart_id' })
  cart!: Cart;
}
