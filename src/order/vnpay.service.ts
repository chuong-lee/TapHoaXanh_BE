import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Payment } from './entities/payment.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import * as crypto from 'crypto';
import * as qs from 'qs';
import axios from 'axios';

@Injectable()
export class VNPayService {
  private readonly logger = new Logger(VNPayService.name);
  
  // VNPAY Configuration - Cập nhật theo demo chính thức
  private readonly VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || '2QXUI4J4';
  private readonly VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || 'KATJWDUZFQKQZQKQZQKQZQKQZQKQZQKQZ';
  private readonly VNPAY_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private readonly VNPAY_API = process.env.VNPAY_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';
  private readonly VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || 'http://localhost:3000/order/payment/vnpay/return';
  private readonly VNPAY_IPN_URL = process.env.VNPAY_IPN_URL || 'http://localhost:3000/order/payment/vnpay/ipn';

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentLog)
    private logRepository: Repository<PaymentLog>,
  ) {}

  /**
   * Tạo URL thanh toán VNPAY - Hoàn toàn tương thích với demo chính thức
   */
  async createPaymentUrl(orderId: number, amount: number, description?: string, bankCode?: string, locale: string = 'vn'): Promise<any> {
    try {
      // Kiểm tra order có tồn tại không
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new BadRequestException(`Order with id ${orderId} not found`);
      }

      // Set timezone như demo chính thức
      process.env.TZ = 'Asia/Ho_Chi_Minh';
      
      // Tạo mã giao dịch duy nhất theo format demo chính thức
      const transactionId = this.generateTransactionId();
      
      // Tạo thời gian giao dịch theo format demo chính thức
      const createDate = this.formatCreateDate();

      // Lấy IP của khách hàng (trong thực tế sẽ lấy từ request)
      const ipAddr = '127.0.0.1';

      // Tạo dữ liệu thanh toán theo demo chính thức
      const vnp_Params: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.VNPAY_TMN_CODE,
        vnp_Locale: locale,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: transactionId,
        vnp_OrderInfo: description || `Thanh toan cho ma GD:${transactionId}`,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100, // VNPAY yêu cầu số tiền nhân 100
        vnp_ReturnUrl: this.VNPAY_RETURN_URL,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      // Thêm bank code nếu có (theo demo chính thức)
      if (bankCode !== null && bankCode !== '') {
        vnp_Params.vnp_BankCode = bankCode;
      }

      // Sắp xếp tham số theo thứ tự alphabet (theo demo chính thức)
      const sortedParams = this.sortObject(vnp_Params);

      // Tạo chuỗi hash theo demo chính thức
      const signData = qs.stringify(sortedParams, { encode: false });
      const signed = crypto
        .createHmac('sha512', this.VNPAY_HASH_SECRET)
        .update(signData)
        .digest('hex');

      // Thêm secure hash vào data
      sortedParams.vnp_SecureHash = signed;

      // Tạo URL thanh toán (theo demo chính thức)
      const paymentUrl = `${this.VNPAY_URL}?${qs.stringify(sortedParams, { encode: false })}`;

      // Lưu thông tin thanh toán vào bảng Payment
      const payment = this.paymentRepository.create({
        source: 'vnpay',
        orderId: orderId,
        amount: amount,
        currency: 'VND',
        description: description || `Thanh toán đơn hàng #${orderId}`,
        payment_method: PaymentMethod.VNPAY,
        payment_status: PaymentStatus.PENDING,
        transaction_id: transactionId,
        gateway_response: {
          payment_url: paymentUrl,
          vnp_data: sortedParams,
          created_at: new Date().toISOString(),
        },
      });

      await this.paymentRepository.save(payment);

      // Log payment creation
      await this.logPaymentCreation(transactionId, amount, PaymentStatus.PENDING);

      return {
        order_id: orderId,
        transaction_id: transactionId,
        amount,
        currency: 'VND',
        payment_url: paymentUrl,
        status: PaymentStatus.PENDING,
        bank_code: bankCode || '',
        locale,
      };
    } catch (error) {
      this.logger.error('Error creating VNPAY payment:', error);
      throw new BadRequestException('Không thể tạo thanh toán VNPAY');
    }
  }

  /**
   * Xử lý callback từ VNPAY (Return URL) - Hoàn toàn tương thích với demo chính thức
   */
  async handleReturn(query: any): Promise<any> {
    try {
      this.logger.log('VNPAY Return callback received:', query);

      // Lấy tham số từ query như demo chính thức
      const vnp_Params = query;
      const secureHash = vnp_Params['vnp_SecureHash'];

      // Xóa secure hash để verify
      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      // Sắp xếp tham số
      const sortedParams = this.sortObject(vnp_Params);

      // Verify hash theo demo chính thức
      const signData = qs.stringify(sortedParams, { encode: false });
      const signed = crypto
        .createHmac('sha512', this.VNPAY_HASH_SECRET)
        .update(signData)
        .digest('hex');

      if (secureHash !== signed) {
        this.logger.warn('Invalid VNPAY return hash');
        return { status: 'error', message: 'Invalid hash', code: '97' };
      }

      const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
      const vnp_TxnRef = vnp_Params['vnp_TxnRef'];
      const vnp_Amount = vnp_Params['vnp_Amount'];
      const vnp_TransactionNo = vnp_Params['vnp_TransactionNo'];
      const vnp_BankCode = vnp_Params['vnp_BankCode'];
      const vnp_PayDate = vnp_Params['vnp_PayDate'];

      // Tìm payment theo transaction_id
      const payment = await this.paymentRepository.findOne({
        where: { transaction_id: vnp_TxnRef },
        relations: ['order'],
      });

      if (!payment) {
        this.logger.warn(`Payment not found for transaction: ${vnp_TxnRef}`);
        return { status: 'error', message: 'Payment not found', code: '01' };
      }

      // Kiểm tra số tiền
      const expectedAmount = (payment.amount || 0) * 100;
      if (parseInt(vnp_Amount) !== expectedAmount) {
        this.logger.warn(`Amount mismatch: expected ${expectedAmount}, received ${vnp_Amount}`);
        return { status: 'error', message: 'Amount mismatch', code: '04' };
      }

      // Xử lý kết quả thanh toán
      if (vnp_ResponseCode === '00') {
        // Thanh toán thành công
        await this.updateOrderPaymentStatus(order.id, PaymentStatus.SUCCESS, {
          vnp_ResponseCode,
          vnp_TransactionNo,
          vnp_Amount,
          vnp_BankCode,
          vnp_PayDate,
          return_data: query,
        });

        return {
          status: 'success',
          message: 'Thanh toán thành công',
          code: '00',
          data: {
            order_id: order.id,
            transaction_id: vnp_TxnRef,
            vnp_transaction_no: vnp_TransactionNo,
            amount: order.payment_amount,
            bank_code: vnp_BankCode,
            pay_date: vnp_PayDate,
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
          code: vnp_ResponseCode,
          data: {
            order_id: order.id,
            transaction_id: vnp_TxnRef,
            response_code: vnp_ResponseCode,
          },
        };
      }
    } catch (error) {
      this.logger.error('Error processing VNPAY return:', error);
      return { status: 'error', message: 'Internal server error', code: '99' };
    }
  }

  /**
   * Xử lý IPN (Instant Payment Notification) từ VNPAY - Hoàn toàn tương thích với demo chính thức
   */
  async handleIPN(query: any): Promise<string> {
    try {
      this.logger.log('VNPAY IPN received:', query);

      // Lấy tham số từ query như demo chính thức
      const vnp_Params = query;
      const secureHash = vnp_Params['vnp_SecureHash'];
      
      const orderId = vnp_Params['vnp_TxnRef'];
      const rspCode = vnp_Params['vnp_ResponseCode'];

      // Xóa secure hash để verify
      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      // Sắp xếp tham số
      const sortedParams = this.sortObject(vnp_Params);

      // Verify hash theo demo chính thức
      const signData = qs.stringify(sortedParams, { encode: false });
      const signed = crypto
        .createHmac('sha512', this.VNPAY_HASH_SECRET)
        .update(signData)
        .digest('hex');

      if (secureHash !== signed) {
        this.logger.warn('Invalid VNPAY IPN hash');
        return 'INVALID_HASH';
      }

      // Tìm order theo transaction_id
      const order = await this.orderRepository.findOne({
        where: { transaction_id: orderId },
      });

      if (!order) {
        this.logger.warn(`Order not found for transaction: ${orderId}`);
        return 'ORDER_NOT_FOUND';
      }

      // Kiểm tra số tiền
      const vnp_Amount = vnp_Params['vnp_Amount'];
      const expectedAmount = (order.payment_amount || 0) * 100;
      if (parseInt(vnp_Amount) !== expectedAmount) {
        this.logger.warn(`Amount mismatch: expected ${expectedAmount}, received ${vnp_Amount}`);
        return 'AMOUNT_MISMATCH';
      }

      // Kiểm tra trạng thái hiện tại của order (theo demo chính thức)
      const paymentStatus = order.payment_status;
      if (paymentStatus === PaymentStatus.SUCCESS || paymentStatus === PaymentStatus.FAIL) {
        this.logger.warn(`Order ${order.id} already processed with status: ${paymentStatus}`);
        return 'ORDER_ALREADY_PROCESSED';
      }

      // Xử lý kết quả thanh toán theo demo chính thức
      if (rspCode === '00') {
        // Thanh toán thành công
        await this.updateOrderPaymentStatus(order.id, PaymentStatus.SUCCESS, {
          vnp_ResponseCode: rspCode,
          vnp_TransactionNo: vnp_Params['vnp_TransactionNo'],
          vnp_Amount,
          ipn_data: query,
        });

        // Log IPN
        await this.logIPN(query, PaymentStatus.SUCCESS);
        
        return 'OK';
      } else {
        // Thanh toán thất bại
        await this.updateOrderPaymentStatus(order.id, PaymentStatus.FAIL, {
          vnp_ResponseCode: rspCode,
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
   * Truy vấn kết quả thanh toán - Hoàn toàn tương thích với demo chính thức
   */
  async queryTransaction(orderId: string, transDate: string): Promise<any> {
    try {
      // Set timezone như demo chính thức
      process.env.TZ = 'Asia/Ho_Chi_Minh';
      const date = new Date();

      const vnp_TmnCode = this.VNPAY_TMN_CODE;
      const secretKey = this.VNPAY_HASH_SECRET;
      const vnp_Api = this.VNPAY_API;
      
      const vnp_TxnRef = orderId;
      const vnp_TransactionDate = transDate;
      
      const vnp_RequestId = this.formatTime(date, 'HHmmss');
      const vnp_Version = '2.1.0';
      const vnp_Command = 'querydr';
      const vnp_OrderInfo = `Truy van GD ma:${vnp_TxnRef}`;
      
      const vnp_IpAddr = '127.0.0.1';
      const currCode = 'VND';
      const vnp_CreateDate = this.formatCreateDate();
      
      // Tạo chuỗi dữ liệu để hash theo demo chính thức
      const data = `${vnp_RequestId}|${vnp_Version}|${vnp_Command}|${vnp_TmnCode}|${vnp_TxnRef}|${vnp_TransactionDate}|${vnp_CreateDate}|${vnp_IpAddr}|${vnp_OrderInfo}`;
      
      const hmac = crypto.createHmac('sha512', secretKey);
      const vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex'); 
      
      const dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
      };

      // Gọi API VNPAY theo demo chính thức
      const response = await axios.post(vnp_Api, dataObj, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Error querying VNPAY transaction:', error);
      throw new BadRequestException('Không thể truy vấn giao dịch VNPAY');
    }
  }

  /**
   * Hoàn tiền giao dịch - Hoàn toàn tương thích với demo chính thức
   */
  async refundTransaction(
    orderId: string,
    transDate: string,
    amount: number,
    transType: string = '02',
    user: string = 'admin',
  ): Promise<any> {
    try {
      // Set timezone như demo chính thức
      process.env.TZ = 'Asia/Ho_Chi_Minh';
      const date = new Date();

      const vnp_TmnCode = this.VNPAY_TMN_CODE;
      const secretKey = this.VNPAY_HASH_SECRET;
      const vnp_Api = this.VNPAY_API;
      
      const vnp_TxnRef = orderId;
      const vnp_TransactionDate = transDate;
      const vnp_Amount = amount * 100;
      const vnp_TransactionType = transType;
      const vnp_CreateBy = user;
            
      const currCode = 'VND';
      
      const vnp_RequestId = this.formatTime(date, 'HHmmss');
      const vnp_Version = '2.1.0';
      const vnp_Command = 'refund';
      const vnp_OrderInfo = `Hoan tien GD ma:${vnp_TxnRef}`;
            
      const vnp_IpAddr = '127.0.0.1';
      const vnp_CreateDate = this.formatCreateDate();
      const vnp_TransactionNo = '0';
      
      // Tạo chuỗi dữ liệu để hash theo demo chính thức
      const data = `${vnp_RequestId}|${vnp_Version}|${vnp_Command}|${vnp_TmnCode}|${vnp_TransactionType}|${vnp_TxnRef}|${vnp_Amount}|${vnp_TransactionNo}|${vnp_TransactionDate}|${vnp_CreateBy}|${vnp_CreateDate}|${vnp_IpAddr}|${vnp_OrderInfo}`;
      const hmac = crypto.createHmac('sha512', secretKey);
      const vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
      
      const dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TransactionType': vnp_TransactionType,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_Amount': vnp_Amount,
        'vnp_TransactionNo': vnp_TransactionNo,
        'vnp_CreateBy': vnp_CreateBy,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
      };
      
      // Gọi API VNPAY theo demo chính thức
      const response = await axios.post(vnp_Api, dataObj, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Error refunding VNPAY transaction:', error);
      throw new BadRequestException('Không thể hoàn tiền giao dịch VNPAY');
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
      gateway_response: order.gateway_response ? JSON.parse(order.gateway_response) : null,
    };
  }

  /**
   * Tạo mã giao dịch duy nhất theo format demo
   */
  private generateTransactionId(): string {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${day}${hour}${minute}${second}`;
  }

  /**
   * Format thời gian tạo giao dịch theo demo
   */
  private formatCreateDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  /**
   * Format thời gian theo pattern
   */
  private formatTime(date: Date, pattern: string): string {
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    
    return pattern
      .replace('HH', hour)
      .replace('mm', minute)
      .replace('ss', second);
  }

  /**
   * Sắp xếp object theo thứ tự alphabet - Theo demo chính thức
   */
  private sortObject(obj: any): any {
    const sorted: any = {};
    const str: string[] = [];
    let key: string;
    
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    
    str.sort();
    
    for (let i = 0; i < str.length; i++) {
      sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, '+');
    }
    
    return sorted;
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
   * Log payment creation
   */
  private async logPaymentCreation(transactionId: string, amount: number, status: PaymentStatus): Promise<void> {
    const log = this.logRepository.create({
      orderId: transactionId,
      gatewayTransactionId: '',
      paymentMethod: 'vnpay',
      rawData: { amount, status },
      status,
    });

    await this.logRepository.save(log);
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

  /**
   * Generate QR Code for VNPay payment
   */
  async generateQRCode(orderId: number): Promise<any> {
    try {
      // Lấy thông tin order
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new BadRequestException(`Order with id ${orderId} not found`);
      }

      // Tạo URL thanh toán VNPay
      const paymentData = await this.createPaymentUrl(orderId, order.payment_amount || 0, order.payment_description);
      
      // Tạo QR code data
      const qrData = {
        order_id: orderId,
        amount: order.payment_amount,
        currency: 'VND',
        payment_url: paymentData.payment_url,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentData.payment_url)}`,
        transaction_id: paymentData.transaction_id,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      return qrData;
    } catch (error) {
      this.logger.error('Error generating VNPay QR code:', error);
      throw new BadRequestException('Không thể tạo QR code VNPay');
    }
  }
}
