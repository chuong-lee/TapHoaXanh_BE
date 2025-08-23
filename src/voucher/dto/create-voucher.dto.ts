import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsDate, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VoucherType } from '../enums/voucher-type.enum';

export class CreateVoucherDto {
  @ApiProperty({ example: 'SALE20', description: 'Mã voucher' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 100000, description: 'Giảm tối đa khi type = %' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max_discount!: number;

  @ApiProperty({ example: 200000, description: 'Giá trị đơn tối thiểu để áp dụng' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_order_value!: number;

  @ApiProperty({ example: 10, description: 'Số lượng voucher còn lại' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity!: number;

  @ApiProperty({ example: false, description: 'Voucher đã được sử dụng hay chưa' })
  @IsBoolean()
  is_used!: boolean;

  @ApiProperty({ example: '2025-08-01T00:00:00Z', description: 'Ngày bắt đầu hiệu lực' })
  @IsDate()
  @Type(() => Date)
  start_date!: Date;

  @ApiProperty({ example: '2025-08-31T23:59:59Z', description: 'Ngày kết thúc hiệu lực' })
  @IsDate()
  @Type(() => Date)
  end_date!: Date;

  @ApiProperty({ enum: VoucherType, example: VoucherType.NORMAL, description: 'Loại voucher' })
  @IsEnum(VoucherType)
  type!: VoucherType;

  @ApiProperty({ example: 50000, description: 'Giá trị giảm (NORMAL = trừ tiền, DISCOUNT = %)' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value!: number;

  @ApiProperty()
  orderId?: number;
}
