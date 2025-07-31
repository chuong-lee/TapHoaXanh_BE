import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../../users/entities/users.entity';
import { News } from '../../news/entities/news.entity';

@Entity('news_views')
export class NewsViews {
  @ApiProperty({ description: 'ID của người dùng', example: 1 })
  @PrimaryColumn()
  user_id: number;

  @ApiProperty({ description: 'ID của bài viết', example: 1 })
  @PrimaryColumn()
  news_id: number;

  @ApiProperty({ description: 'Thời gian xem', example: '2025-07-29T10:30:00.000Z' })
  @CreateDateColumn({ type: 'datetime' })
  viewed_at: Date;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => News, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'news_id' })
  news: News;
}
