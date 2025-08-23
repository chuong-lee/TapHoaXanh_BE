import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from 'src/order/order.repository';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { VoucherRepository } from './voucher.repository';
import { FilterVoucherDto } from './dto/filter-voucher.dto';

@Injectable()
export class VoucherService {
  constructor(
    private readonly voucherRepository: VoucherRepository,
    private readonly orderRepository: OrderRepository,
  ) {}
  async create(createVoucherDto: CreateVoucherDto) {
    const voucher = await this.voucherRepository.create({ ...createVoucherDto });
    if (createVoucherDto.orderId) {
      const orderExist = await this.orderRepository.findById(createVoucherDto.orderId);
      if (!orderExist) throw new NotFoundException('Đơn hàng không tồn tại');
      voucher.order = orderExist;
    }
    return await this.voucherRepository.save(voucher);
  }

  findAll() {
    return `This action returns all voucher`;
  }

  async filterAllVoucher(query: FilterVoucherDto) {
    return await this.voucherRepository.filterAllVoucher(query);
  }

  async findOne(id: number) {
    return await this.voucherRepository.findById(id);
  }

  update(id: number, _updateVoucherDto: UpdateVoucherDto) {
    return `This action updates a #${id} voucher`;
  }

  remove(id: number) {
    return `This action removes a #${id} voucher`;
  }
}
