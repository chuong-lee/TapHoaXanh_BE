import { AbstractEntity } from '../../database/database.entity';
import { Product } from '../../products/entities/product.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('brand')
export class Brand extends AbstractEntity<Brand> {
  @Column()
  name!: string;

  @OneToMany(() => Product, (product) => product.brand)
  product!: Product[];
}
