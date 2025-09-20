import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICartItemService } from '../cart_item/interfaces/icart_item-service.interface';
import { OrderItemService } from '../order_item/order_item.service';
import { v4 as uuidv4 } from 'uuid';
import { IUsersRepository } from '../users/interfaces/iusers-repository.interface';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { DataSource } from 'typeorm';
import { OrderRepository } from './order.repository';
import { Product } from '../products/entities/product.entity';
import { OrderItem } from '../order_item/entities/order_item.entity';
import { Voucher } from '../voucher/entities/voucher.entity';
import { VoucherType } from '../voucher/enums/voucher-type.enum';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,

    @Inject(IUsersRepository) // 👈 inject đúng token
    private readonly userRepository: IUsersRepository,

    private readonly cartItemService: ICartItemService,

    private readonly orderItemService: OrderItemService,
    private readonly dataSource: DataSource,
  ) {}

  // Order CRUD operations
  async create(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
    // Tạo order_code tự động bằng UUID
    const orderCode = this.generateOrderCode();

    const order = this.orderRepository.create({
      ...createOrderDto,
      order_code: orderCode,
      status: PaymentStatus.PENDING,
    });
    const findUser = await this.userRepository.findById(userId);
    if (!findUser) throw new NotFoundException('User này không tồn tại');
    order.user = findUser;
    return this.orderRepository.save(order);
  }

  // Tạo order_code tự động bằng UUID
  private generateOrderCode(): string {
    const uuid = uuidv4();
    // Lấy 8 ký tự đầu của UUID và thêm prefix ORD
    return `${uuid.toUpperCase()}`;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async filterAllOrder(query: FilterOrderDto) {
    return this.orderRepository.filterAllOrder(query);
  }
  async findAllOwned(userId: number): Promise<Order[]> {
    return this.orderRepository.findAllOwned(userId);
  }

  async findOne(id: number): Promise<Order> {
    return this.orderRepository.findOne(id);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    return this.orderRepository.updateOrder(id, updateOrderDto);
  }

  async remove(id: number): Promise<void> {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Order with id ${id} not found`);
  }

  // Cập nhật trạng thái thanh toán kèm điều chỉnh tồn kho theo cơ chế "đặt chỗ" khi PENDING
  async updatePaymentStatusWithInventory(orderId: number, toStatus: PaymentStatus): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.orderRepository.findWithItemsAndProducts(orderId);

      if (toStatus === PaymentStatus.PENDING) {
        // Đặt chỗ tồn kho ngay khi tạo/đặt PENDING
        for (const item of order.orderItem) {
          const product = item.product;
          if (!product) throw new BadRequestException('Sản phẩm không hợp lệ');
          if (product.quantity < item.quantity) {
            throw new BadRequestException(`Tồn kho không đủ cho sản phẩm ${product.id}`);
          }
          product.quantity -= item.quantity;
          await queryRunner.manager.getRepository(product.constructor as any).save(product);
        }
      }

      if (toStatus === PaymentStatus.FAIL) {
        // Hoàn kho khi thất bại
        for (const item of order.orderItem) {
          const product = item.product;
          if (!product) continue;
          product.quantity += item.quantity;
          await queryRunner.manager.getRepository(product.constructor as any).save(product);
        }
      }

      const updated = await this.orderRepository.updatePayment(orderId, { status: toStatus });
      await queryRunner.commitTransaction();
      return updated;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async countNumberOfOrder(year: number, month?: number): Promise<number> {
    return this.orderRepository.countNumberOfOrder(year, month);
  }

  // Helper function để tính discount từ voucher
  private calculateVoucherDiscount(totalPrice: number, voucher: Voucher): number {
    // Xử lý voucher có type null (có thể là voucher cũ hoặc free shipping)
    if (voucher.type === null || voucher.type === undefined) {
      // Nếu type null, coi như giảm cố định bằng max_discount
      const discount = Math.min(voucher.max_discount, totalPrice);
      return discount;
    }

    if (voucher.type === VoucherType.PERCENTAGE) {
      // Giảm theo phần trăm
      const discount = (totalPrice * voucher.value) / 100;
      // Giới hạn tối đa theo max_discount
      const finalDiscount = Math.min(discount, voucher.max_discount);
      return finalDiscount;
    }

    if (voucher.type === VoucherType.NORMAL) {
      // Giảm cố định
      const discount = Math.min(voucher.value, totalPrice);
      return discount;
    }

    return 0;
  }

  // Tạo order từ cart items được chọn
  async createOrderFromCart(createOrderDto: CreateOrderFromCartDto, userId: number): Promise<Order> {
    const cartItems = await this.cartItemService.findByIds(createOrderDto.cartItemIds, userId);
    if (cartItems.length === 0) {
      throw new BadRequestException('Không có sản phẩm nào được chọn');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Tính tổng và chuẩn bị order items
      const { totalPrice, preparedItems } = await this.prepareOrderItems(cartItems, queryRunner);

      // 2. Tạo order cơ bản
      const order = await this.createBasicOrder(createOrderDto, userId, totalPrice);

      // 3. Xử lý voucher nếu có
      const finalTotalPrice = await this.processVoucherIfExists(
        createOrderDto.voucherId,
        totalPrice,
        order,
        queryRunner,
      );

      // 4. Cập nhật total price và lưu order
      order.total_price = finalTotalPrice;
      const savedOrder = await queryRunner.manager.getRepository(Order).save(order as any);

      // 5. Tạo order items
      await this.createOrderItems(preparedItems, savedOrder, queryRunner);

      await queryRunner.commitTransaction();

      // 6. Xóa cart items (ngoài transaction)
      await this.cartItemService.removeByIds(createOrderDto.cartItemIds, userId);

      return savedOrder;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  // 1. Chuẩn bị order items và tính tổng giá
  private async prepareOrderItems(
    cartItems: any[],
    queryRunner: any,
  ): Promise<{ totalPrice: number; preparedItems: any[] }> {
    let totalPrice = 0;
    const preparedItems: { quantity: number; unit_price: number; product: Product }[] = [];

    for (const cartItem of cartItems) {
      if (!cartItem.product) {
        throw new BadRequestException(`Cart item ${cartItem.id} không có sản phẩm hợp lệ`);
      }

      const product = await queryRunner.manager.getRepository(Product).findOne({ where: { id: cartItem.product.id } });
      if (!product) {
        throw new NotFoundException('Sản phẩm không tồn tại');
      }

      // Check tồn kho và trừ kho (đặt chỗ) ngay khi tạo PENDING
      if (product.quantity < cartItem.quantity) {
        throw new BadRequestException(
          `Tồn kho không đủ cho sản phẩm ${product.id}. Còn: ${product.quantity}, yêu cầu: ${cartItem.quantity}`,
        );
      }
      product.quantity -= cartItem.quantity;
      await queryRunner.manager.getRepository(Product).save(product);

      totalPrice += cartItem.price * cartItem.quantity;
      preparedItems.push({ quantity: cartItem.quantity, unit_price: cartItem.price, product });
    }

    return { totalPrice, preparedItems };
  }

  // 2. Tạo order cơ bản
  private async createBasicOrder(
    createOrderDto: CreateOrderFromCartDto,
    userId: number,
    totalPrice: number,
  ): Promise<Order> {
    const order = this.orderRepository.create({
      total_price: totalPrice,
      note: createOrderDto.note,
      order_code: this.generateOrderCode(),
      status: PaymentStatus.PENDING,
    });

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User này không tồn tại');
    }
    order.user = user;

    return order;
  }

  // 3. Xử lý voucher nếu có
  private async processVoucherIfExists(
    voucherId: number | undefined,
    totalPrice: number,
    order: Order,
    queryRunner: any,
  ): Promise<number> {
    if (!voucherId) {
      return totalPrice;
    }

    const voucher = await this.validateAndGetVoucher(voucherId, totalPrice, queryRunner);

    const discount = this.calculateVoucherDiscount(totalPrice, voucher);
    const finalTotalPrice = Math.max(0, totalPrice - discount);

    // Cập nhật voucher quantity
    await this.updateVoucherQuantity(voucher, queryRunner);

    // Gán voucher vào order
    order.voucher = [voucher];

    return finalTotalPrice;
  }

  // 3.1. Validate và lấy voucher
  private async validateAndGetVoucher(voucherId: number, totalPrice: number, queryRunner: any): Promise<Voucher> {
    const voucher = await queryRunner.manager.getRepository(Voucher).findOne({ where: { id: voucherId } });

    if (!voucher) {
      throw new NotFoundException('Voucher không tồn tại');
    }

    // Kiểm tra voucher còn hạn và còn số lượng
    if (voucher.quantity <= 0) {
      throw new BadRequestException('Voucher đã hết lượt sử dụng');
    }

    const now = new Date();
    if (now < voucher.start_date || now > voucher.end_date) {
      throw new BadRequestException('Voucher không còn hiệu lực');
    }

    // Kiểm tra điều kiện sử dụng voucher
    if (totalPrice < voucher.min_order_value) {
      throw new BadRequestException(`Đơn hàng phải tối thiểu ${voucher.min_order_value} để sử dụng voucher này`);
    }

    return voucher;
  }

  // 3.2. Cập nhật số lượng voucher
  private async updateVoucherQuantity(voucher: Voucher, queryRunner: any): Promise<void> {
    voucher.quantity -= 1;
    if (voucher.quantity === 0) {
      voucher.is_used = true;
    }

    await queryRunner.manager.getRepository(Voucher).save(voucher);
  }

  // 4. Tạo order items
  private async createOrderItems(preparedItems: any[], savedOrder: Order, queryRunner: any): Promise<void> {
    for (const item of preparedItems) {
      const orderItem = queryRunner.manager.create(OrderItem, {
        quantity: item.quantity,
        unit_price: item.unit_price,
        order: savedOrder,
        product: item.product,
      });
      await queryRunner.manager.save(orderItem);
    }
  }

  async getTotalRevenueSuccess(year: number, month?: number) {
    return await this.orderRepository.getTotalRevenueSuccess(year, month);
  }

  async getMonthlyRevenueSuccess(year: number) {
    return await this.orderRepository.getMonthlyRevenueSuccess(year);
  }

  async getOrderDetailByCode(orderCode: string) {
    return await this.orderRepository.getOrderDetailByCode(orderCode);
  }
}
