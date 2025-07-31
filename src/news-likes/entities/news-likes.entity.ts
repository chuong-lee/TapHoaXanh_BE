import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from 'src/users/entities/users.entity';
import { News } from 'src/news/entities/news.entity';

@Entity('news_likes')
export class NewsLikes {
  @ApiProperty({ description: 'ID của người dùng', example: 1 })
  @PrimaryColumn()
  user_id: number;

  @ApiProperty({ description: 'ID của bài viết', example: 1 })
  @PrimaryColumn()
  news_id: number;

  @ApiProperty({ description: 'Thời gian thích bài viết', example: '2023-12-01T10:00:00Z' })
  @CreateDateColumn()
  liked_at: Date;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => News, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'news_id' })
  news: News;
}
