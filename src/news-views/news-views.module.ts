import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsViewsController } from './news-views.controller';
import { NewsViewsService } from './news-views.service';
import { NewsViewsRepository } from './news-views.repository';
import { NewsViews } from './entities/news-views.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsViews])],
  controllers: [NewsViewsController],
  providers: [NewsViewsService, NewsViewsRepository],
  exports: [NewsViewsService, NewsViewsRepository],
})
export class NewsViewsModule {}
