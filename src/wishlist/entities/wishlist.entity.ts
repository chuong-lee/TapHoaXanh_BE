import { AbstractEntity } from '../../database/database.entity';
import { Product } from '../../products/entities/product.entity';
import { Users } from '../../users/entities/users.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('wishlist')
export class Wishlist extends AbstractEntity<Wishlist> {
  @ManyToOne(() => Users, (users) => users.wishlist)
  @JoinColumn({ name: 'user_id' })
  users!: Users;

  @ManyToOne(() => Product, (product) => product.wishlist)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
