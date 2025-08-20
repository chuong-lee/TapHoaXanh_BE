import { AbstractEntity } from 'src/database/database.entity';
import { Product } from 'src/products/entities/product.entity';
import { Users } from 'src/users/entities/users.entity';
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
