import { AbstractEntity } from 'src/database/database.entity';
import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { Users } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('rating')
export class Rating extends AbstractEntity<Rating> {
  @Column()
  comment: string;

  @Column()
  rating: number;

  @ManyToOne(() => Order, (order) => order.rating)
  order: Order;

  @ManyToOne(() => Users, (users) => users.rating)
  users: Users;

  @ManyToOne(() => Product, (product) => product.rating)
  product: Product;
}
