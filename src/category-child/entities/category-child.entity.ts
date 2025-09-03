// src/category-child/entities/category-child.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';

@Entity('category_child')
export class CategoryChild {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  parent_id!: number;

  @ManyToOne(() => Category, (category) => category.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parentCategory!: Category;
}
