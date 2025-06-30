import {
  Controller,
  Patch,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  Get,
  Delete,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Tạo thanh toán mới
  @Post('charge')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentService.createCharge(createPaymentDto);
    return {
      status: 'success',
      data: payment,
    };
  }

  // Lấy danh sách toàn bộ thanh toán
  @Get()
  async findAll() {
    const payments = await this.paymentService.findAll();
    return {
      status: 'success',
      data: payments,
    };
  }

  // Lấy thanh toán theo ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const payment = await this.paymentService.findOne(id);
    return {
      status: 'success',
      data: payment,
    };
  }

  // Cập nhật thanh toán theo ID
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id', ParseIntPipe) id: number,@Body() updatePaymentDto: UpdatePaymentDto) {
    const updatedPayment = await this.paymentService.update(id, updatePaymentDto);
    return {
      status: 'success',
      data: updatedPayment,
    };
  }

  // Xóa thanh toán theo ID
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.paymentService.remove(id);
    return {
      status: 'success',
      message: `Payment with id ${id} deleted successfully`,
    };
  }
}
