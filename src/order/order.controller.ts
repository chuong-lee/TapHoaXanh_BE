import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmBankTransferDto } from './dto/confirm-bank-transfer.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }

  // Payment endpoints
  @Post('payment/charge')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    const payment = await this.orderService.createCharge(createPaymentDto);
    return {
      status: 'success',
      data: payment,
    };
  }

  @Get('payment')
  async findAllPayments() {
    const payments = await this.orderService.findAllPayments();
    return {
      status: 'success',
      data: payments,
    };
  }

  @Get('payment/:id')
  async findOnePayment(@Param('id', ParseIntPipe) id: number) {
    const payment = await this.orderService.findOnePayment(id);
    return {
      status: 'success',
      data: payment,
    };
  }

  @Patch('payment/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updatePayment(@Param('id', ParseIntPipe) id: number, @Body() updateData: Partial<any>) {
    const updatedPayment = await this.orderService.updatePayment(id, updateData);
    return {
      status: 'success',
      data: updatedPayment,
    };
  }

  @Delete('payment/:id')
  async removePayment(@Param('id', ParseIntPipe) id: number) {
    await this.orderService.removePayment(id);
    return {
      status: 'success',
      message: `Payment with id ${id} deleted successfully`,
    };
  }

  @Post('payment/confirm-bank-transfer')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async confirmBankTransfer(@Body() confirmDto: ConfirmBankTransferDto) {
    const payment = await this.orderService.confirmBankTransfer(confirmDto);
    return {
      status: 'success',
      data: payment,
      message: 'Bank transfer confirmed successfully',
    };
  }
}
