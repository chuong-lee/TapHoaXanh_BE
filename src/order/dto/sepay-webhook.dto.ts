import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class SePayWebhookDto {
  @IsString()
  gateway: string;

  @IsDateString()
  transaction_date: string;

  @IsString()
  @IsOptional()
  account_number?: string;

  @IsString()
  @IsOptional()
  sub_account?: string;

  @IsNumber()
  amount_in: number;

  @IsNumber()
  amount_out: number;

  @IsNumber()
  accumulated: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  transaction_id?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  signature?: string;
}

export class SePayWebhookResponseDto {
  status: string;
  message: string;
  data?: any;
}
