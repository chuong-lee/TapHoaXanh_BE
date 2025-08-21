import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Users } from '../../users/entities/users.entity';
import { CartItem } from '../../cart_item/entities/cart_item.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Users, (user) => user.cart)
  @JoinColumn({ name: 'user_id' })
  user!: Users;

  @OneToMany(() => CartItem, (item) => item.cart)
  @JoinColumn({ name: 'cart_id' })
  cartItems?: CartItem[];
}
