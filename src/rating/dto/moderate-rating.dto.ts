import { IsNotEmpty, IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RatingStatus, RatingModerationReason } from '../entities/rating.entity';

export class ModerateRatingDto {
  @ApiProperty({
    description: 'Trạng thái duyệt đánh giá',
    enum: RatingStatus,
    example: RatingStatus.APPROVED
  })
  @IsNotEmpty()
  @IsEnum(RatingStatus)
  status!: RatingStatus;

  @ApiProperty({
    description: 'Lý do từ chối (nếu có)',
    enum: RatingModerationReason,
    required: false,
    example: RatingModerationReason.INAPPROPRIATE_CONTENT
  })
  @IsOptional()
  @IsEnum(RatingModerationReason)
  moderation_reason?: RatingModerationReason;

  @ApiProperty({
    description: 'Ghi chú duyệt',
    example: 'Nội dung phù hợp, đã duyệt',
    required: false
  })
  @IsOptional()
  @IsString()
  moderation_note?: string;

  @ApiProperty({
    description: 'ID của admin duyệt',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  moderated_by!: number;
}
