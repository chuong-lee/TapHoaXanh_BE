export class BankTransferInfoDto {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  qrCode?: string;
  amount?: number;
  transferContent?: string;
  note?: string;
}

export class PaymentResponseDto {
  paymentUrl?: string;
  bankTransferInfo?: BankTransferInfoDto;
  paymentMethod?: string;
  status?: string;
  message?: string;
}
