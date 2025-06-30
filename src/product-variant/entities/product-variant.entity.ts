import { AbstractEntity } from 'src/database/database.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('product_variant')
export class ProductVariant extends AbstractEntity<ProductVariant> {
  @Column()
  variant_name: string;

  @Column()
  price_modifier: number;

  @Column()
  stock: number;

  @ManyToOne(() => Product, (product) => product.variants)
  product: Product;
}
