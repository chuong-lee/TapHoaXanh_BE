import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import * as crypto from 'crypto';
import * as qs from 'qs';
import axios from 'axios';

@Injectable()
export class VNPayService {
  private readonly logger = new Logger(VNPayService.name);
  
  // VNPAY Configuration
  private readonly VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || '2QXUI4J4';
  private readonly VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || 'KATJWDUZFQKQZQKQZQKQZQKQZQKQZQKQZ';
  private readonly VNPAY_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private readonly VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || 'http://localhost:3000/order/payment/vnpay/return';
  private readonly VNPAY_IPN_URL = process.env.VNPAY_IPN_URL || 'http://localhost:3000/order/payment/vnpay/ipn';

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(PaymentLog)
    private logRepository: Repository<PaymentLog>,
  ) {}

  /**
   * Tạo URL thanh toán VNPAY
   */
  async createPaymentUrl(orderId: number, amount: number, description?: string): Promise<any> {
    try {
      // Kiểm tra order có tồn tại không
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new BadRequestException(`Order with id ${orderId} not found`);
      }

      // Tạo mã giao dịch duy nhất
      const transactionId = this.generateTransactionId();
      
      // Tạo thời gian giao dịch
      const createDate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + '0700';

      // Tạo dữ liệu thanh toán
      const paymentData: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.VNPAY_TMN_CODE,
        vnp_Amount: amount * 100, // VNPAY yêu cầu số tiền nhân 100
        vnp_CurrCode: 'VND',
        vnp_BankCode: '', // Để trống để hiển thị tất cả ngân hàng
        vnp_TxnRef: transactionId,
        vnp_OrderInfo: description || `Thanh toán đơn hàng #${orderId}`,
        vnp_OrderType: 'other',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: this.VNPAY_RETURN_URL,
        vnp_IpnUrl: this.VNPAY_IPN_URL,
        vnp_CreateDate: createDate,
        vnp_IpAddr: '127.0.0.1', // IP của khách hàng
      };

      // Tạo chuỗi hash
      const hashData = qs.stringify(paymentData, { encode: false });
      const vnp_SecureHash = crypto
        .createHmac('sha512', this.VNPAY_HASH_SECRET)
        .update(hashData)
        .digest('hex');

      // Thêm secure hash vào data
      paymentData.vnp_SecureHash = vnp_SecureHash;

      // Tạo URL thanh toán
      const paymentUrl = `${this.VNPAY_URL}?${qs.stringify(paymentData, { encode: false })}`;

      // Cập nhật thông tin thanh toán vào order
      await this.orderRepository.update(orderId, {
        payment_amount: amount,
        payment_description: description || `Thanh toán đơn hàng #${orderId}`,
        payment_method: PaymentMethod.VNPAY,
        payment_status: PaymentStatus.PENDING,
        transaction_id: transactionId,
        gateway_response: JSON.stringify({
          payment_url: paymentUrl,
          vnp_data: paymentData,
        }),
      });

      return {
        order_id: orderId,
        transaction_id: transactionId,
        amount,
        currency: 'VND',
        payment_url: paymentUrl,
        status: PaymentStatus.PENDING,
      };
    } catch (error) {
      this.logger.error('Error creating VNPAY payment:', error);
      throw new BadRequestException('Không thể tạo thanh toán VNPAY');
    }
  }

  /**
   * Xử lý callback từ VNPAY (Return URL)
   */
  async handleReturn(query: any): Promise<any> {
    try {
      this.logger.log('VNPAY Return callback received:', query);

      // Verify hash
      if (!this.verifyReturnHash(query)) {
        this.logger.warn('Invalid VNPAY return hash');
        return { status: 'error', message: 'Invalid hash' };
      }

      const vnp_ResponseCode = query.vnp_ResponseCode;
      const vnp_TxnRef = query.vnp_TxnRef;
      const vnp_Amount = query.vnp_Amount;
      const vnp_TransactionNo = query.vnp_TransactionNo;

      // Tìm order theo transaction_id
      const order = await this.orderRepository.findOne({
        where: { transaction_id: vnp_TxnRef },
      });

      if (!order) {
        this.logger.warn(`Order not found for transaction: ${vnp_TxnRef}`);
        return { status: 'error', message: 'Order not found' };
      }

      // Kiểm tra số tiền
      const expectedAmount = (order.payment_amount || 0) * 100;
      if (parseInt(vnp_Amount) !== expectedAmount) {
        this.logger.warn(`Amount mismatch: expected ${expectedAmount}, received ${vnp_Amount}`);
        return { status: 'error', message: 'Amount mismatch' };
      }

      // Xử lý kết quả thanh toán
      if (vnp_ResponseCode === '00') {
        // Thanh toán thành công
        await this.updateOrderPaymentStatus(order.id, PaymentStatus.SUCCESS, {
          vnp_ResponseCode,
          vnp_TransactionNo,
          vnp_Amount,
          return_data: query,
        });

        return {
          status: 'success',
          message: 'Thanh toán thành công',
          data: {
            order_id: order.id,
            transaction_id: vnp_TxnRef,
            vnp_transaction_no: vnp_TransactionNo,
            amount: order.payment_amount,
          },
        };
      } else {
        // Thanh toán thất bại
        await this.updateOrderPaymentStatus(order.id, PaymentStatus.FAIL, {
          vnp_ResponseCode,
          vnp_Amount,
          return_data: query,
        });

        return {
          status: 'error',
          message: `Thanh toán thất bại. Mã lỗi: ${vnp_ResponseCode}`,
          data: {
            order_id: order.id,
            transaction_id: vnp_TxnRef,
            response_code: vnp_ResponseCode,
          },
        };
      }
    } catch (error) {
      this.logger.error('Error processing VNPAY return:', error);
      return { status: 'error', message: 'Internal server error' };
    }
  }

  /**
   * Xử lý IPN (Instant Payment Notification) từ VNPAY
   */
  async handleIPN(query: any): Promise<string> {
    try {
      this.logger.log('VNPAY IPN received:', query);

      // Verify hash
      if (!this.verifyReturnHash(query)) {
        this.logger.warn('Invalid VNPAY IPN hash');
        return 'INVALID_HASH';
      }

      const vnp_ResponseCode = query.vnp_ResponseCode;
      const vnp_TxnRef = query.vnp_TxnRef;
      const vnp_Amount = query.vnp_Amount;
      const vnp_TransactionNo = query.vnp_TransactionNo;

      // Tìm order theo transaction_id
      const order = await this.orderRepository.findOne({
        where: { transaction_id: vnp_TxnRef },
      });

      if (!order) {
        this.logger.warn(`Order not found for transaction: ${vnp_TxnRef}`);
        return 'ORDER_NOT_FOUND';
      }

      // Kiểm tra số tiền
      const expectedAmount = (order.payment_amount || 0) * 100;
      if (parseInt(vnp_Amount) !== expectedAmount) {
        this.logger.warn(`Amount mismatch: expected ${expectedAmount}, received ${vnp_Amount}`);
        return 'AMOUNT_MISMATCH';
      }

      // Xử lý kết quả thanh toán
      if (vnp_ResponseCode === '00') {
        // Thanh toán thành công
        await this.updateOrderPaymentStatus(order.id, PaymentStatus.SUCCESS, {
          vnp_ResponseCode,
          vnp_TransactionNo,
          vnp_Amount,
          ipn_data: query,
        });

        // Log IPN
        await this.logIPN(query, PaymentStatus.SUCCESS);
        
        return 'OK';
      } else {
        // Thanh toán thất bại
        await this.updateOrderPaymentStatus(order.id, PaymentStatus.FAIL, {
          vnp_ResponseCode,
          vnp_Amount,
          ipn_data: query,
        });

        // Log IPN
        await this.logIPN(query, PaymentStatus.FAIL);
        
        return 'OK';
      }
    } catch (error) {
      this.logger.error('Error processing VNPAY IPN:', error);
      return 'INTERNAL_ERROR';
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán
   */
  async checkPaymentStatus(orderId: number): Promise<any> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return {
      order_id: order.id,
      transaction_id: order.transaction_id,
      amount: order.payment_amount,
      status: order.payment_status,
      payment_method: order.payment_method,
      description: order.payment_description,
    };
  }

  /**
   * Tạo mã giao dịch duy nhất
   */
  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `VNPAY${timestamp}${random}`.toUpperCase();
  }

  /**
   * Verify hash từ VNPAY
   */
  private verifyReturnHash(query: any): boolean {
    const vnp_SecureHash = query.vnp_SecureHash;
    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    const hashData = qs.stringify(query, { encode: false });
    const checkSum = crypto
      .createHmac('sha512', this.VNPAY_HASH_SECRET)
      .update(hashData)
      .digest('hex');

    return vnp_SecureHash === checkSum;
  }

  /**
   * Cập nhật trạng thái thanh toán của order
   */
  private async updateOrderPaymentStatus(orderId: number, status: PaymentStatus, paymentData: any): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException(`Order with id ${orderId} not found`);
    }
    
    const existingGatewayResponse = order.gateway_response ? JSON.parse(order.gateway_response) : {};
    
    await this.orderRepository.update(orderId, {
      payment_status: status,
      gateway_response: JSON.stringify({
        ...existingGatewayResponse,
        payment_data: paymentData,
        updated_at: new Date().toISOString(),
      }),
    });
  }

  /**
   * Log IPN data
   */
  private async logIPN(ipnData: any, status: PaymentStatus): Promise<void> {
    const log = this.logRepository.create({
      orderId: ipnData.vnp_TxnRef || 'unknown',
      gatewayTransactionId: ipnData.vnp_TransactionNo,
      paymentMethod: 'vnpay',
      rawData: ipnData,
      status,
    });

    await this.logRepository.save(log);
  }
}
