import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { Users } from '../../users/entities/users.entity';
import { CartItem } from '../../cart_item/entities/cart_item.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantity!: number;

  @ManyToOne(() => Users, (user) => user.cart)
  @JoinColumn({ name: 'user_id' })
  user!: Users;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @OneToMany(() => CartItem, (item) => item.cart)
  @JoinColumn({ name: 'cart_id' })
  cartItems?: CartItem[];
}
