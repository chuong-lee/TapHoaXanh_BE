import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '../order/order.repository';
import { IpnFailChecksum, IpnInvalidAmount, IpnOrderNotFound, IpnSuccess, ProductCode, VNPay, VnpLocale } from 'vnpay';
import { CreatePaymentDto } from './dto/payment.dto';
import { PaymentRepository } from './payment.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly vnpay: VNPay,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const { orderId } = createPaymentDto;
    if (!orderId) throw new NotFoundException('Chưa chọn đơn hàng');
    const orderExist = await this.orderRepository.findById(orderId);
    if (!orderExist) throw new NotFoundException('Đơn hàng không tồn tại');
    const txnRef = uuidv4();
    const url = await this.vnpay.buildPaymentUrl({
      vnp_Amount: orderExist.total_price * 100, // ✅ Nhân 100 theo yêu cầu VNPAY
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${orderExist.order_code}`, // ✅ Không dấu theo yêu cầu VNPAY
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL as string,
      vnp_Locale: VnpLocale.VN,
      vnp_IpAddr: '127.0.0.1',
    });

    // ✅ Lưu payment record với txn_ref
    const payment = this.paymentRepository.create({
      payment_method: 'VNPAY',
      status: 'pending',
      amount: orderExist.total_price,
      order: orderExist,
      txn_ref: txnRef, // Lưu txn_ref để tìm payment khi callback
    });
    await this.paymentRepository.save(payment);

    return { paymentUrl: url };
  }

  handleReturn(query: any) {
    const verify = this.vnpay.verifyReturnUrl(query);

    if (!verify.isVerified) return { success: false, message: 'Xác thực dữ liệu thất bại' };
    if (!verify.isSuccess) return { success: false, message: 'Thanh toán thất bại' };

    // TODO: Cập nhật trạng thái đơn hàng trong DB nếu muốn
    // example: updateOrderStatus(verify.vnp_TxnRef, 'completed');

    return { success: true, message: 'Thanh toán thành công', orderId: verify.vnp_TxnRef };
  }

  async handleIpn(query: any) {
    const verify = this.vnpay.verifyIpnCall(query);

    if (!verify.isVerified) return IpnFailChecksum;
    if (!verify.isSuccess) return IpnFailChecksum; // có thể trả IpnUnknownError

    // TODO: Lấy order từ DB theo verify.vnp_TxnRef
    const order = await this.orderRepository.findByOrderCode(verify.vnp_TxnRef);
    if (!order) return IpnOrderNotFound;

    // Kiểm tra số tiền
    if (verify.vnp_Amount !== order.total_price) return IpnInvalidAmount;

    // Cập nhật trạng thái đơn hàng
    if (order.status !== 'completed') {
      order.status = 'completed';
      await this.orderRepository.save(order);
    }

    return IpnSuccess;
  }

  async handleVNPayCallback(queryParams: any) {
    // Tìm payment record dựa vào txn_ref với order relation
    const payment = await this.paymentRepository.findOneByTxnRefWithOrder(queryParams.vnp_TxnRef);

    if (!payment) {
      throw new NotFoundException('Không tìm thấy payment record');
    }

    // Cập nhật status dựa vào response_code
    if (queryParams.vnp_ResponseCode === '00') {
      payment.status = 'success';
      // Có thể cập nhật status order thành 'paid' ở đây
    } else {
      payment.status = 'failed';
    }

    // Lưu vào database
    const savedPayment = await this.paymentRepository.save(payment);

    return {
      success: true,
      message: 'Payment processed successfully',
      payment: savedPayment,
    };
  }
}
