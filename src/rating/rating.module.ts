import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { Rating } from './entities/rating.entity';
import { RatingRepository } from './rating.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Rating])],
  controllers: [RatingController],
  providers: [RatingService, RatingRepository],
  exports: [RatingService, RatingRepository],
})
export class RatingModule {}
