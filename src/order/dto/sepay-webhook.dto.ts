import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class SePayWebhookDto {
  @ApiProperty({ description: 'Transaction ID' })
  @IsString()
  transaction_id!: string;

  @ApiProperty({ description: 'Order ID' })
  @IsString()
  order_id!: string;

  @ApiProperty({ description: 'Amount' })
  @IsNumber()
  amount_in!: number;

  @ApiProperty({ description: 'Status' })
  @IsString()
  status!: string;

  @ApiProperty({ description: 'Reference', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ description: 'Payment method', required: false })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class SePayWebhookResponseDto {
  @ApiProperty({ description: 'Status' })
  status!: string;

  @ApiProperty({ description: 'Message' })
  message!: string;

  @ApiProperty({ description: 'Data', required: false })
  data?: any;
}
