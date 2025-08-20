import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVNPayPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  bankCode?: string; // Mã ngân hàng cụ thể (nếu có)
}

export class VNPayReturnDto {
  vnp_ResponseCode: string;
  vnp_TxnRef: string;
  vnp_Amount: string;
  vnp_TransactionNo: string;
  vnp_SecureHash: string;
  vnp_SecureHashType: string;
  [key: string]: any;
}
