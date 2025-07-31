import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BankTransferInfoDto, PaymentResponseDto } from './dto/bank-transfer.dto';
import { ConfirmBankTransferDto } from './dto/confirm-bank-transfer.dto';
import { Order } from './entities/order.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import * as crypto from 'crypto';
import * as qs from 'qs';
import axios from 'axios';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(PaymentLog)
    private logRepo: Repository<PaymentLog>,
  ) {}

  // Order CRUD operations
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create({
      ...createOrderDto,
      currency: createOrderDto.currency || 'VND',
      payment_status: createOrderDto.payment_status || PaymentStatus.PENDING,
    });
    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['users', 'voucher', 'orderItem', 'rating'],
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['users', 'voucher', 'orderItem', 'rating'],
    });
    if (!order) throw new NotFoundException(`Order with id ${id} not found`);
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.preload({ id: Number(id), ...updateOrderDto });
    if (!order) throw new NotFoundException(`Order with id ${id} not found`);
    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Order with id ${id} not found`);
  }

  // Payment operations
  async createCharge(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    // Tạo order mới với payment info
    const order = this.orderRepository.create({
      payment_amount: createPaymentDto.amount,
      currency: createPaymentDto.currency || 'VND',
      payment_source: createPaymentDto.source,
      payment_description: createPaymentDto.description,
      payment_method: createPaymentDto.payment_method,
      payment_status: PaymentStatus.PENDING,
      // Có thể thêm các field order khác nếu cần
      price: createPaymentDto.amount,
      quantity: 1,
      images: '',
      comment: createPaymentDto.description || '',
    });

    const saved = await this.orderRepository.save(order);

    switch (createPaymentDto.payment_method) {
      case PaymentMethod.MOMO:
        return this.createMomoPayment(saved);
      case PaymentMethod.VNPAY:
        return this.createVnpayPayment(saved);
      case PaymentMethod.BANK_TRANSFER:
        return this.createBankTransferPayment(saved);
      default:
        throw new InternalServerErrorException('Unsupported payment method');
    }
  }

  private async createMomoPayment(order: Order): Promise<PaymentResponseDto> {
    const momoConfig = {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      accessKey: process.env.MOMO_ACCESS_KEY,
      secretKey: process.env.MOMO_SECRET_KEY,
      endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
      returnUrl: process.env.MOMO_RETURN_URL,
      notifyUrl: process.env.MOMO_NOTIFY_URL,
    };

    const requestId = order.id.toString();
    const orderId = `${order.id}-${Date.now()}`;
    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${order.payment_amount}&extraData=&ipnUrl=${momoConfig.notifyUrl}&orderId=${orderId}&orderInfo=${order.payment_description}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.returnUrl}&requestId=${requestId}&requestType=captureWallet`;

    const signature = crypto
      .createHmac('sha256', momoConfig.secretKey || '')
      .update(rawSignature)
      .digest('hex');

    const body = {
      partnerCode: momoConfig.partnerCode,
      accessKey: momoConfig.accessKey,
      requestId,
      amount: order.payment_amount?.toString(),
      orderId,
      orderInfo: order.payment_description,
      redirectUrl: momoConfig.returnUrl,
      ipnUrl: momoConfig.notifyUrl,
      requestType: 'captureWallet',
      signature,
      extraData: '',
      lang: 'vi',
    };

    const response = await axios.post(momoConfig.endpoint, body);
    const data = response.data as {
      resultCode: number;
      message: string;
      payUrl: string;
    };

    await this.logRepo.save({
      orderId: orderId,
      gatewayTransactionId: data.resultCode === 0 ? data.payUrl : '',
      paymentMethod: 'momo',
      rawData: data,
      status: data.resultCode === 0 ? 'success' : 'fail',
      reason: data.message,
    });

    return {
      paymentUrl: data.payUrl,
      paymentMethod: 'momo',
      status: data.resultCode === 0 ? 'success' : 'fail',
      message: data.message,
    };
  }

  private createVnpayPayment(order: Order): PaymentResponseDto {
    const vnpConfig = {
      tmnCode: process.env.VNP_TMNCODE,
      secretKey: process.env.VNP_HASH_SECRET,
      url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      returnUrl: process.env.VNP_RETURN_URL,
    };

    const date = new Date();
    const createDate = date
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 14);
    const txnRef = `${order.id}-${Date.now()}`;
    const amount = (order.payment_amount || 0) * 100;

    const params: Record<string, any> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpConfig.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: order.payment_description,
      vnp_OrderType: 'billpayment',
      vnp_Amount: amount,
      vnp_ReturnUrl: vnpConfig.returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc: Record<string, any>, key: string) => {
        acc[key] = params[key];
        return acc;
      }, {});

    const signData = qs.stringify(sortedParams, { encode: false });
    const secureHash = crypto
      .createHmac('sha512', vnpConfig.secretKey || '')
      .update(signData)
      .digest('hex');

    const paymentUrl = `${vnpConfig.url}?${signData}&vnp_SecureHash=${secureHash}`;

    this.logRepo.save({
      orderId: txnRef,
      gatewayTransactionId: '',
      paymentMethod: 'vnpay',
      rawData: params,
      status: 'pending',
    });

    return {
      paymentUrl,
      paymentMethod: 'vnpay',
      status: 'pending',
    };
  }

  private async createBankTransferPayment(order: Order): Promise<PaymentResponseDto> {
    // Thông tin tài khoản ngân hàng của bạn - có thể đưa vào environment variables
    const bankInfo = {
      bankName: process.env.BANK_NAME || 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
      accountName: process.env.BANK_ACCOUNT_NAME || 'NGUYEN VAN A',
    };

    // Tạo nội dung chuyển khoản với mã đơn hàng
    const transferContent = `TapHoaXanh ${order.id} ${
      order.payment_description || 'Thanh toan don hang'
    }`.substring(0, 50);

    // Tạo QR code URL (có thể sử dụng API của ngân hàng hoặc service tạo QR)
    const qrCodeData = `${bankInfo.accountNumber}|${bankInfo.accountName}|${order.payment_amount}|${transferContent}`;
    const qrCodeUrl = await this.generateQRCode(
      qrCodeData,
      order.payment_amount || 0,
      bankInfo.accountNumber,
      transferContent,
    );

    // Log payment info
    await this.logRepo.save({
      orderId: order.id.toString(),
      gatewayTransactionId: `BANK_${order.id}_${Date.now()}`,
      paymentMethod: 'bank_transfer',
      rawData: {
        bankInfo,
        amount: order.payment_amount,
        transferContent,
        qrCode: qrCodeUrl,
      },
      status: 'pending',
      reason: 'Waiting for bank transfer confirmation',
    });

    const bankTransferInfo: BankTransferInfoDto = {
      bankName: bankInfo.bankName,
      accountNumber: bankInfo.accountNumber,
      accountName: bankInfo.accountName,
      qrCode: qrCodeUrl,
      amount: order.payment_amount || 0,
      transferContent,
      note: `Vui lòng chuyển khoản đúng nội dung: "${transferContent}" để được xử lý tự động`,
    };

    return {
      bankTransferInfo,
      paymentMethod: 'bank_transfer',
      status: 'pending',
      message: 'Vui lòng thực hiện chuyển khoản theo thông tin bên dưới',
    };
  }

  private async generateQRCode(data: string, amount: number, accountNumber: string, content: string): Promise<string> {
    // Tạo QR code cho Vietcombank (có thể thay đổi theo ngân hàng của bạn)
    // Format theo chuẩn VietQR
    const bankCode = '970436'; // Mã ngân hàng Vietcombank
    const qrString = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(content)}`;
    
    return qrString;
  }

  async confirmBankTransfer(confirmDto: ConfirmBankTransferDto): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id: confirmDto.paymentId });
    if (!order) {
      throw new NotFoundException(`Order with id ${confirmDto.paymentId} not found`);
    }

    if (order.payment_method !== PaymentMethod.BANK_TRANSFER) {
      throw new InternalServerErrorException('This order is not a bank transfer payment');
    }

    // Cập nhật trạng thái thanh toán
    order.payment_status = confirmDto.status || PaymentStatus.SUCCESS;
    order.transaction_id = confirmDto.transactionId;

    // Log confirmation
    await this.logRepo.save({
      orderId: order.id.toString(),
      gatewayTransactionId: confirmDto.transactionId,
      paymentMethod: 'bank_transfer_confirm',
      rawData: {
        transactionId: confirmDto.transactionId,
        transactionImage: confirmDto.transactionImage,
        note: confirmDto.note,
        confirmedAt: new Date(),
      },
      status: confirmDto.status === PaymentStatus.SUCCESS ? 'success' : 'fail',
      reason: confirmDto.note || 'Bank transfer confirmed',
    });

    return this.orderRepository.save(order);
  }

  // Payment-related methods that work with Order
  async findAllPayments(): Promise<Order[]> {
    return this.orderRepository.find({
      where: { payment_method: PaymentMethod.BANK_TRANSFER },
      relations: ['users'],
    });
  }

  async findOnePayment(id: number): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) throw new NotFoundException(`Order with id ${id} not found`);
    return order;
  }

  async updatePayment(id: number, updateData: Partial<Order>): Promise<Order> {
    const order = await this.orderRepository.preload({ id: Number(id), ...updateData });
    if (!order) throw new NotFoundException(`Order with id ${id} not found`);
    return this.orderRepository.save(order);
  }

  async removePayment(id: number): Promise<void> {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Order with id ${id} not found`);
  }
}
