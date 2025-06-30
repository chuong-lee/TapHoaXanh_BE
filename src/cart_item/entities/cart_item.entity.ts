import { Cart } from 'src/cart/entities/cart.entity';
import { AbstractEntity } from 'src/database/database.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('cart_item')
export class CartItem extends AbstractEntity<CartItem> {
  @Column()
  quantity: number;

  @Column()
  total_price: number;

  @Column()
  price: number;

  
  @ManyToOne(() => Product, (product) => product.cartItems) 
  product: Product;

  @ManyToOne(() => Cart, (cart) => cart.cartItems) 
  cart: Cart;
}
