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
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ✅ Tạo thanh toán mới — đã bọc try/catch
  @Post('charge')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      const payment = await this.paymentService.createCharge(createPaymentDto);
      return {
        status: 'success',
        data: payment,
      };
    } catch (error) {
      console.error('[PaymentController][POST /charge] Error:', error);
      throw new InternalServerErrorException('Không thể tạo thanh toán. Vui lòng thử lại sau.');
    }
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
    if (!payment) {
      throw new NotFoundException(`Không tìm thấy thanh toán với ID: ${id}`);
    }
    return {
      status: 'success',
      data: payment,
    };
  }

  // Cập nhật thanh toán theo ID
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePaymentDto: UpdatePaymentDto) {
    try {
      const updatedPayment = await this.paymentService.update(id, updatePaymentDto);
      return {
        status: 'success',
        data: updatedPayment,
      };
    } catch (error) {
      console.error(`[PaymentController][PATCH /${id}] Error:`, error);
      throw new InternalServerErrorException('Không thể cập nhật thanh toán');
    }
  }

  // Xóa thanh toán theo ID
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.paymentService.remove(id);
      return {
        status: 'success',
        message: `Thanh toán với ID ${id} đã được xóa.`,
      };
    } catch (error) {
      console.error(`[PaymentController][DELETE /${id}] Error:`, error);
      throw new InternalServerErrorException('Không thể xóa thanh toán');
    }
  }
}
