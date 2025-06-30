// payment.service.ts
import {Injectable,InternalServerErrorException,NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import * as crypto from 'crypto';
import * as qs from 'qs';
import axios from 'axios';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,

    @InjectRepository(PaymentLog)
    private logRepo: Repository<PaymentLog>, // ✅ tên đúng
  ) {}

  async createCharge(createPaymentDto: CreatePaymentDto): Promise<{ paymentUrl: string }> {
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      currency: createPaymentDto.currency || 'VND',
      payment_status: PaymentStatus.PENDING,
    });

    const saved = await this.paymentRepository.save(payment);

    switch (createPaymentDto.payment_method) {
      case PaymentMethod.MOMO:
        return this.createMomoPayment(saved);
      case PaymentMethod.VNPAY:
        return this.createVnpayPayment(saved);
      default:
        throw new InternalServerErrorException('Unsupported payment method');
    }
  }

  private async createMomoPayment(payment: Payment): Promise<{ paymentUrl: string }> {
    const momoConfig = {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      accessKey: process.env.MOMO_ACCESS_KEY,
      secretKey: process.env.MOMO_SECRET_KEY,
      endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
      returnUrl: process.env.MOMO_RETURN_URL,
      notifyUrl: process.env.MOMO_NOTIFY_URL,
    };

    const requestId = payment.id.toString();
    const orderId = `${payment.order?.id || 'UNKNOWN'}-${Date.now()}`;
    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${payment.amount}&extraData=&ipnUrl=${momoConfig.notifyUrl}&orderId=${orderId}&orderInfo=${payment.description}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.returnUrl}&requestId=${requestId}&requestType=captureWallet`;

    const signature = crypto
      .createHmac('sha256', momoConfig.secretKey || '')
      .update(rawSignature)
      .digest('hex');

    const body = {
      partnerCode: momoConfig.partnerCode,
      accessKey: momoConfig.accessKey,
      requestId,
      amount: payment.amount.toString(),
      orderId,
      orderInfo: payment.description,
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

    return { paymentUrl: data.payUrl };
  }

  private createVnpayPayment(payment: Payment): { paymentUrl: string } {
    const vnpConfig = {
      tmnCode: process.env.VNP_TMNCODE,
      secretKey: process.env.VNP_HASH_SECRET,
      url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      returnUrl: process.env.VNP_RETURN_URL,
    };

    const date = new Date();
    const createDate = date.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const txnRef = `${payment.order?.id || 'UNKNOWN'}-${Date.now()}`;
    const amount = payment.amount * 100;

    const params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpConfig.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: payment.description,
      vnp_OrderType: 'billpayment',
      vnp_Amount: amount,
      vnp_ReturnUrl: vnpConfig.returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

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
      reason: undefined,
    });

    return { paymentUrl };
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find();
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) throw new NotFoundException(`Payment with id ${id} not found`);
    return payment;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.paymentRepository.preload({ id, ...updatePaymentDto });
    if (!payment) throw new NotFoundException(`Payment with id ${id} not found`);
    return this.paymentRepository.save(payment);
  }

  async remove(id: number): Promise<void> {
    const result = await this.paymentRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Payment with id ${id} not found`);
  }
}
