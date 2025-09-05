import { IsNotEmpty, IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RatingFlagReason } from '../entities/rating.entity';

export class FlagRatingDto {
  @ApiProperty({
    description: 'Lý do báo cáo',
    enum: RatingFlagReason,
    example: RatingFlagReason.INAPPROPRIATE_CONTENT
  })
  @IsNotEmpty()
  @IsEnum(RatingFlagReason)
  flag_reason!: RatingFlagReason;

  @ApiProperty({
    description: 'Ghi chú báo cáo',
    example: 'Nội dung không phù hợp, có từ ngữ xúc phạm',
    required: false
  })
  @IsOptional()
  @IsString()
  flag_note?: string;

  @ApiProperty({
    description: 'ID của user báo cáo',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  flagged_by!: number;
}
