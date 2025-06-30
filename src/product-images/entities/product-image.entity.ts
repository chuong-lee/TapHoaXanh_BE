import { AbstractEntity } from 'src/database/database.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('product_images')
export class ProductImage extends AbstractEntity<ProductImage> {
  @Column()
  image_url: string;

  @ManyToOne(() => Product, (product) => product.image)
  product: Product;
}
