import { AbstractEntity } from '../../database/database.entity';
import { Product } from '../../products/entities/product.entity';
import { Users } from '../../users/entities/users.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('rating')
export class Rating extends AbstractEntity<Rating> {
  @Column()
  comment?: string;

  @Column()
  rating?: number;

  @ManyToOne(() => Users, (users) => users.rating)
  @JoinColumn({ name: 'user_id' })
  users!: Users;

  @ManyToOne(() => Product, (product) => product.rating)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
