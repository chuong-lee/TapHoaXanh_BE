import { AbstractEntity } from '../../database/database.entity';
import { Product } from '../../products/entities/product.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('category')
export class Category extends AbstractEntity<Category> {
  @Column()
  name!: string;

  @Column()
  slug!: string;

  @Column()
  parent_id!: number;

  @OneToMany(() => Product, (product) => product.category)
  product!: Product[];
}
