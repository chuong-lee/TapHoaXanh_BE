import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUsersRepository } from 'src/users/interfaces/iusers-repository.interface';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { FilterOrderDto } from './dto/filter-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @Inject(IUsersRepository) // 👈 inject đúng token
    private readonly userRepository: IUsersRepository,
  ) {}

  // Order CRUD operations
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create({
      ...createOrderDto,
      status: createOrderDto.status || PaymentStatus.PENDING,
    });
    const findUser = await this.userRepository.findById(createOrderDto.userId);
    if (!findUser) throw new NotFoundException('User này không tồn tại');
    order.user = findUser;
    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['users', 'voucher', 'orderItem'],
    });
  }

  async filterAllOrder(query: FilterOrderDto) {
    const { search, status, page = 1, limit = 10 } = query;

    const qb = this.orderRepository
      .createQueryBuilder('o')
      .innerJoin('o.user', 'u')
      .select([
        'o.id AS id',
        'o.order_code AS orderCode',
        'o.status AS status',
        'o.total_price AS totalPrice',
        'u.name AS userName',
        'u.phone AS userPhone',
      ]);

    if (search) {
      qb.andWhere(
        `(LOWER(o.order_code) LIKE LOWER(:search)
        OR LOWER(u.name) LIKE LOWER(:search)
        OR LOWER(u.phone) LIKE LOWER(:search))`,
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere(`LOWER(o.status) LIKE LOWER(:status)`, {
        status: `%${status}%`,
      });
    }

    qb.orderBy('o.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await Promise.all([
      qb.getRawMany(),
      qb
        .clone()
        .select('COUNT(o.id)', 'count')
        .getRawOne()
        .then((r) => Number(r.count)),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['users', 'voucher', 'orderItem'],
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
  // async createCharge(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
  //   // Tính tổng tiền các sản phẩm
  //   let total = 0;
  //   if (Array.isArray((createPaymentDto as any).orderItems)) {
  //     for (const item of (createPaymentDto as any).orderItems) {
  //       total += (item.unit_price || 0) * (item.quantity || 1);
  //     }
  //   } else {
  //     total = (createPaymentDto as any).amount || 0;
  //   }

  //   // Áp dụng voucher nếu có (hỗ trợ cả giảm giá và freeship)
  //   let discount = 0;
  //   let freeship = 0;
  //   let voucherInfo = null;
  //   const shippingFee = (createPaymentDto as any).shippingFee || 0;
  //   if ((createPaymentDto as any).voucher) {
  //     voucherInfo = (createPaymentDto as any).voucher;
  //     if (voucherInfo && total >= (voucherInfo.min_order_value || 0)) {
  //       if (voucherInfo.type === VoucherType.DISCOUNT) {
  //         discount = Math.min(voucherInfo.max_discount || 0, total * 0.1);
  //       } else if (voucherInfo.type === VoucherType.FREESHIP) {
  //         freeship = Math.min(voucherInfo.max_discount || 0, shippingFee);
  //       }
  //     }
  //   }
  //   const finalAmount = total - discount - freeship + (shippingFee - freeship);

  //   // Tạo order mới
  //   const order = this.orderRepository.create({
  //     total_price: total,
  //     discount,
  //     freeship,
  //     shipping_fee: shippingFee,
  //     quantity: (createPaymentDto as any).orderItems?.length || 1,
  //     images: (createPaymentDto as any).orderItems?.[0]?.image || '',
  //     comment: createPaymentDto.description || 'Thanh toan qua cổng thanh toán',
  //     payment_amount: finalAmount,
  //     payment_description: createPaymentDto.description,
  //     payment_method: createPaymentDto.payment_method,
  //     payment_status: PaymentStatus.PENDING,
  //     currency: createPaymentDto.currency || 'VND',
  //   });

  //   const savedOrder = await this.orderRepository.save(order);

  //   // Tạo thanh toán theo phương thức
  //   switch (createPaymentDto.payment_method) {
  //     case PaymentMethod.MOMO:
  //       return this.createMomoPayment(savedOrder);
  //     case PaymentMethod.VNPAY:
  //       return this.createVnpayPayment(savedOrder);
  //     case PaymentMethod.BANK_TRANSFER:
  //       return this.createBankTransferPayment(savedOrder, finalAmount);
  //     default:
  //       throw new InternalServerErrorException('Unsupported payment method');
  //   }
  // }

  // private async createMomoPayment(order: Order): Promise<PaymentResponseDto> {
  //   const momoConfig = {
  //     partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
  //     accessKey: process.env.MOMO_ACCESS_KEY || 'accessKey',
  //     secretKey: process.env.MOMO_SECRET_KEY || 'secretKey',
  //     endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  //   };

  //   const requestId = `${order.id}-${Date.now()}`;
  //   const orderId = `${order.id}-${Date.now()}`;
  //   const amount = order.payment_amount || 0;
  //   const orderInfo = order.payment_description || 'Thanh toan don hang';
  //   const redirectUrl = process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payment/return';
  //   const ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:3000/payment/ipn';
  //   const requestType = 'captureWallet';

  //   const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  //   const signature = crypto.createHmac('sha256', momoConfig.secretKey).update(rawSignature).digest('hex');

  //   const requestBody = {
  //     partnerCode: momoConfig.partnerCode,
  //     partnerName: 'Test',
  //     storeId: 'MomoTestStore',
  //     requestId: requestId,
  //     amount: amount,
  //     orderId: orderId,
  //     orderInfo: orderInfo,
  //     redirectUrl: redirectUrl,
  //     ipnUrl: ipnUrl,
  //     lang: 'vi',
  //     requestType: requestType,
  //     autoCapture: true,
  //     extraData: '',
  //     signature: signature,
  //   };

  //   try {
  //     const response = await axios.post(momoConfig.endpoint, requestBody, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     const data = response.data as any;

  //     await this.logRepo.save({
  //       orderId: orderId,
  //       gatewayTransactionId: data.resultCode === 0 ? data.payUrl : '',
  //       paymentMethod: 'momo',
  //       rawData: data,
  //       status: data.resultCode === 0 ? PaymentStatus.SUCCESS : PaymentStatus.FAIL,
  //       reason: data.message,
  //     });

  //     return {
  //       paymentUrl: data.payUrl,
  //       paymentMethod: 'momo',
  //       status: data.resultCode === 0 ? 'success' : 'fail',
  //       message: data.message,
  //     };
  //   } catch (error) {
  //     throw new InternalServerErrorException('Failed to create MoMo payment');
  //   }
  // }

  // private createVnpayPayment(order: Order): PaymentResponseDto {
  //   const vnpConfig = {
  //     tmnCode: process.env.VNP_TMNCODE,
  //     secretKey: process.env.VNP_HASH_SECRET,
  //     url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  //     returnUrl: process.env.VNP_RETURN_URL,
  //   };

  //   const date = new Date();
  //   const createDate = date
  //     .toISOString()
  //     .replace(/[-T:.Z]/g, '')
  //     .slice(0, 14);
  //   const txnRef = `${order.id}-${Date.now()}`;
  //   const amount = (order.payment_amount || 0) * 100;

  //   const params: Record<string, any> = {
  //     vnp_Version: '2.1.0',
  //     vnp_Command: 'pay',
  //     vnp_TmnCode: vnpConfig.tmnCode,
  //     vnp_Locale: 'vn',
  //     vnp_CurrCode: 'VND',
  //     vnp_TxnRef: txnRef,
  //     vnp_OrderInfo: order.payment_description,
  //     vnp_OrderType: 'billpayment',
  //     vnp_Amount: amount,
  //     vnp_ReturnUrl: vnpConfig.returnUrl,
  //     vnp_IpAddr: '127.0.0.1',
  //     vnp_CreateDate: createDate,
  //   };

  //   const sortedParams = Object.keys(params)
  //     .sort()
  //     .reduce((acc: Record<string, any>, key: string) => {
  //       acc[key] = params[key];
  //       return acc;
  //     }, {});

  //   const signData = qs.stringify(sortedParams, { encode: false });
  //   const secureHash = crypto
  //     .createHmac('sha512', vnpConfig.secretKey || '')
  //     .update(signData)
  //     .digest('hex');

  //   const paymentUrl = `${vnpConfig.url}?${signData}&vnp_SecureHash=${secureHash}`;

  //   this.logRepo.save({
  //     orderId: txnRef,
  //     gatewayTransactionId: '',
  //     paymentMethod: 'vnpay',
  //     rawData: params,
  //     status: PaymentStatus.PENDING,
  //   });

  //   return {
  //     paymentUrl,
  //     paymentMethod: 'vnpay',
  //     status: 'pending',
  //   };
  // }

  // private async createBankTransferPayment(order: Order, finalAmount?: number): Promise<PaymentResponseDto> {
  //   // Thông tin tài khoản ngân hàng của bạn - có thể đưa vào environment variables
  //   const bankInfo = {
  //     bankName: process.env.BANK_NAME || 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
  //     accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
  //     accountName: process.env.BANK_ACCOUNT_NAME || 'NGUYEN VAN A',
  //   };

  //   // Tạo nội dung chuyển khoản với mã đơn hàng
  //   const transferContent = `TapHoaXanh ${order.id} ${order.payment_description || 'Thanh toan don hang'}`.substring(
  //     0,
  //     50,
  //   );

  //   // Số tiền cuối cùng đã tính giảm giá
  //   const amount = finalAmount !== undefined ? finalAmount : order.payment_amount || 0;

  //   // Tạo QR code URL (có thể sử dụng API của ngân hàng hoặc service tạo QR)
  //   const qrCodeData = `${bankInfo.accountNumber}|${bankInfo.accountName}|${amount}|${transferContent}`;
  //   const qrCodeUrl = await this.generateQRCode(qrCodeData, amount, bankInfo.accountNumber, transferContent);

  //   // Log payment info
  //   await this.logRepo.save({
  //     orderId: order.id.toString(),
  //     gatewayTransactionId: `BANK_${order.id}_${Date.now()}`,
  //     paymentMethod: 'bank_transfer',
  //     rawData: {
  //       bankInfo,
  //       amount,
  //       transferContent,
  //       qrCode: qrCodeUrl,
  //     },
  //     status: PaymentStatus.PENDING,
  //     reason: 'Waiting for bank transfer confirmation',
  //   });

  //   const bankTransferInfo: BankTransferInfoDto = {
  //     bankName: bankInfo.bankName,
  //     accountNumber: bankInfo.accountNumber,
  //     accountName: bankInfo.accountName,
  //     qrCode: qrCodeUrl,
  //     amount,
  //     transferContent,
  //     note: `Vui lòng chuyển khoản đúng nội dung: "${transferContent}" để được xử lý tự động`,
  //   };

  //   return {
  //     bankTransferInfo,
  //     paymentMethod: 'bank_transfer',
  //     status: 'pending',
  //     message: 'Vui lòng thực hiện chuyển khoản theo thông tin bên dưới',
  //   };
  // }

  // private async generateQRCode(data: string, amount: number, accountNumber: string, content: string): Promise<string> {
  //   // Tạo QR code cho Vietcombank (có thể thay đổi theo ngân hàng của bạn)
  //   // Format theo chuẩn VietQR
  //   const bankCode = '970436'; // Mã ngân hàng Vietcombank
  //   const qrString = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(content)}`;
  //   return qrString;
  // }

  // async confirmBankTransfer(confirmDto: ConfirmBankTransferDto): Promise<Order> {
  //   const order = await this.orderRepository.findOneBy({ id: confirmDto.paymentId });
  //   if (!order) {
  //     throw new NotFoundException(`Order with id ${confirmDto.paymentId} not found`);
  //   }

  //   if (order.payment_method !== PaymentMethod.BANK_TRANSFER) {
  //     throw new InternalServerErrorException('This order is not a bank transfer payment');
  //   }

  //   // Cập nhật trạng thái thanh toán
  //   order.payment_status = confirmDto.status || PaymentStatus.SUCCESS;
  //   order.transaction_id = confirmDto.transactionId;

  //   // Log confirmation
  //   await this.logRepo.save({
  //     orderId: order.id.toString(),
  //     gatewayTransactionId: confirmDto.transactionId,
  //     paymentMethod: 'bank_transfer_confirm',
  //     rawData: {
  //       transactionId: confirmDto.transactionId,
  //       transactionImage: confirmDto.transactionImage,
  //       note: confirmDto.note,
  //       confirmedAt: new Date(),
  //     },
  //     status: confirmDto.status === PaymentStatus.SUCCESS ? PaymentStatus.SUCCESS : PaymentStatus.FAIL,
  //     reason: confirmDto.note || 'Bank transfer confirmed',
  //   });

  //   return this.orderRepository.save(order);
  // }

  // // Payment-related methods that work with Order
  // async findAllPayments(): Promise<Order[]> {
  //   return this.orderRepository.find({
  //     where: { payment_method: PaymentMethod.BANK_TRANSFER },
  //     relations: ['users'],
  //   });
  // }

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

  async countNumberOfOrder(): Promise<number> {
    return await this.orderRepository.count({
      where: { status: PaymentStatus.SUCCESS },
    });
  }
}
