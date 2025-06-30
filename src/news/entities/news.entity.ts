import { AbstractEntity } from 'src/database/database.entity';
import { Column, Entity } from 'typeorm';

@Entity('news')
export class News extends AbstractEntity<News> {
  @Column()
  name: string;

  @Column()
  images: string;

  @Column()
  description: string;
}
