import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsLikesController } from './news-likes.controller';
import { NewsLikesService } from './news-likes.service';
import { NewsLikesRepository } from './news-likes.repository';
import { NewsLikes } from './entities/news-likes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsLikes])],
  controllers: [NewsLikesController],
  providers: [NewsLikesService, NewsLikesRepository],
  exports: [NewsLikesService, NewsLikesRepository],
})
export class NewsLikesModule {}
