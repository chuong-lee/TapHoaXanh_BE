import { AbstractEntity } from 'src/database/database.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('brand')
export class Brand extends AbstractEntity<Brand> {
  @Column()
  name: string;
  @Column()
  address: string;

  @Column()
  phone: string;

  @OneToMany(() => Product, (product) => product.brand)
  product: Product[];
}
