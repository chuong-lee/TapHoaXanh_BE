import { Users } from '../../users/entities/users.entity';
import { AbstractEntity } from '../../database/database.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Category } from '../../category/entities/category.entity';

@Entity('news')
export class News extends AbstractEntity<News> {
  @Column('varchar', { length: 255 })
  name?: string;

  @Column('text', { nullable: true })
  summary?: string;

  @Column('text', { nullable: true })
  images?: string;

  @Column('text')
  description?: string;

  @Column('int', { default: 0 })
  views?: number;

  @Column('int', { default: 0 })
  likes?: number;

  @Column('int', { default: 0 })
  comments_count?: number;

  @Column('int', { nullable: true })
  author_id?: number;

  @Column('int', { nullable: true })
  category_id?: number;

  @Column('varchar', { length: 50, nullable: true })
  type?: string;

  @ManyToOne(() => Users, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author?: Users;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: Category;
}
