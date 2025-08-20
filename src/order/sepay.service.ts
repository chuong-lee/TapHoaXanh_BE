import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { SePayWebhookDto, SePayWebhookResponseDto } from './dto/sepay-webhook.dto';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class SePayService {
  private readonly logger = new Logger(SePayService.name);
  private readonly SEPAY_API_URL = 'https://api.sepay.vn';
  private readonly SEPAY_WEBHOOK_SECRET = process.env.SEPAY_WEBHOOK_SECRET || 'your_webhook_secret';

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(PaymentLog)
    private logRepository: Repository<PaymentLog>,
  ) {}

  /**
   * Tạo thanh toán mới với SePay
   */
  async createPayment(orderId: number, amount: number, description?: string): Promise<any> {
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
      
      // Tạo nội dung chuyển khoản
      const transferContent = `THX${orderId.toString().padStart(6, '0')}`;

      // Tạo QR code và thông tin ngân hàng
      const bankInfo = await this.generateBankInfo(amount, transferContent);

      // Cập nhật thông tin thanh toán vào order
      await this.orderRepository.update(orderId, {
        payment_amount: amount,
        payment_description: description || `Thanh toán đơn hàng #${orderId}`,
        payment_method: PaymentMethod.BANK_TRANSFER,
        payment_status: PaymentStatus.PENDING,
        transaction_id: transactionId,
        gateway_response: JSON.stringify({
          qr_code_url: bankInfo.qrCodeUrl,
          bank_account_number: bankInfo.accountNumber,
          bank_account_name: bankInfo.accountName,
          bank_name: bankInfo.bankName,
          transfer_content: transferContent,
        }),
      });

      return {
        order_id: orderId,
        transaction_id: transactionId,
        amount,
        currency: 'VND',
        transfer_content: transferContent,
        qr_code_url: bankInfo.qrCodeUrl,
        bank_info: {
          account_number: bankInfo.accountNumber,
          account_name: bankInfo.accountName,
          bank_name: bankInfo.bankName,
        },
        status: PaymentStatus.PENDING,
      };
    } catch (error) {
      this.logger.error('Error creating SePay payment:', error);
      throw new BadRequestException('Không thể tạo thanh toán');
    }
  }

  /**
   * Xử lý webhook từ SePay
   */
  async handleWebhook(webhookData: SePayWebhookDto, signature: string): Promise<SePayWebhookResponseDto> {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(webhookData, signature)) {
        this.logger.warn('Invalid webhook signature');
        return { status: 'error', message: 'Invalid signature' };
      }

      // Log webhook data
      await this.logWebhook(webhookData);

      // Tìm order dựa trên reference hoặc description
      const reference = webhookData.reference || webhookData.description;
      if (!reference) {
        this.logger.warn('No reference or description found in webhook data');
        return { status: 'error', message: 'No reference found' };
      }

      const order = await this.findOrderByReference(reference);
      
      if (!order) {
        this.logger.warn(`Order not found for reference: ${reference}`);
        return { status: 'error', message: 'Order not found' };
      }

      // Kiểm tra số tiền
      if (webhookData.amount_in !== order.payment_amount) {
        this.logger.warn(`Amount mismatch: expected ${order.payment_amount}, received ${webhookData.amount_in}`);
        return { status: 'error', message: 'Amount mismatch' };
      }

      // Cập nhật trạng thái thanh toán
      await this.updateOrderPaymentStatus(order.id, PaymentStatus.SUCCESS, webhookData);

      return { status: 'success', message: 'Payment processed successfully' };
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      return { status: 'error', message: 'Internal server error' };
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
    return `THX${timestamp}${random}`.toUpperCase();
  }

  /**
   * Tạo thông tin ngân hàng (mock data - thay thế bằng API thực tế)
   */
  private async generateBankInfo(amount: number, transferContent: string): Promise<any> {
    // Trong thực tế, bạn sẽ gọi API SePay để lấy thông tin ngân hàng
    // Đây là mock data cho demo
    return {
      qrCodeUrl: `https://api.sepay.vn/qr/generate?amount=${amount}&content=${transferContent}`,
      accountNumber: '1234567890',
      accountName: 'CONG TY TAP HOA XANH',
      bankName: 'Vietcombank',
    };
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(data: any, signature: string): boolean {
    const payload = JSON.stringify(data);
    const expectedSignature = crypto
      .createHmac('sha256', this.SEPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Tìm order theo reference
   */
  private async findOrderByReference(reference: string): Promise<Order | null> {
    if (!reference) return null;

    // Tìm theo transfer_content (lưu trong gateway_response)
    const orders = await this.orderRepository.find();
    
    for (const order of orders) {
      if (order.gateway_response) {
        try {
          const gatewayData = JSON.parse(order.gateway_response);
          if (gatewayData.transfer_content === reference) {
            return order;
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
      
      // Tìm theo transaction_id
      if (order.transaction_id === reference) {
        return order;
      }
    }

    return null;
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
   * Log webhook data
   */
  private async logWebhook(webhookData: SePayWebhookDto): Promise<void> {
    const log = this.logRepository.create({
      orderId: webhookData.reference || 'unknown',
      gatewayTransactionId: webhookData.transaction_id,
      paymentMethod: 'bank_transfer',
      rawData: webhookData,
      status: PaymentStatus.SUCCESS,
    });

    await this.logRepository.save(log);
  }
}
