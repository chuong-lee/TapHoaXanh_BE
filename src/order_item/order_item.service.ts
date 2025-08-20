import { Injectable } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order_item.dto';
import { UpdateOrderItemDto } from './dto/update-order_item.dto';

@Injectable()
export class OrderItemService {
  create(_createOrderItemDto: CreateOrderItemDto) {
    return 'This action adds a new orderItem';
  }

  findAll() {
    return `This action returns all orderItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orderItem`;
  }

  update(id: number, _updateOrderItemDto: UpdateOrderItemDto) {
    return `This action updates a #${id} orderItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderItem`;
  }
}
