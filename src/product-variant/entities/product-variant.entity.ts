import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('product_variant')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;

  @Column()
  name!: string;

  @Column()
  price!: number;

  @Column({ default: 0 })
  stock!: number;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product?: Product;
}
