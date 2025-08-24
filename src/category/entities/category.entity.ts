import { AbstractEntity } from 'src/database/database.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, OneToMany } from 'typeorm';


@Entity('category')
export class Category extends AbstractEntity<Category> {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  parent_id: number;

  @OneToMany(() => Product, (product) => product.category)
  product: Product[];

}
