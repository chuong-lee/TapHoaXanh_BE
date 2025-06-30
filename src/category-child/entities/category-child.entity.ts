// src/category-child/entities/category-child.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('category_child')
export class CategoryChild {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  parent_id: number;

  @ManyToOne(() => Category, (category) => category.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parentCategory: Category;

  @OneToMany(() => Product, (product) => product.category_child)
  products: Product[];
}
