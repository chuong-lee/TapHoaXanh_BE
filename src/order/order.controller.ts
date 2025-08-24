import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';
import { FilterOrderDto } from './dto/filter-order.dto';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    // private readonly sepayService: SePayService,
    // private readonly vnpayService: VNPayService,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get('/search')
  filterAllOrder(@Query() filter: FilterOrderDto) {
    return this.orderService.filterAllOrder(filter);
  }

  @Get('/count')
  countNumberOfOrder() {
    return this.orderService.countNumberOfOrder();
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
  // @Post('payment/charge')
  // @HttpCode(HttpStatus.CREATED)
  // @UsePipes(new ValidationPipe({ whitelist: true }))
  // async createPayment(@Body() createPaymentDto: CreateVNPayPaymentDto) {
  //   const payment = await this.orderService.createCharge(createPaymentDto);
  //   return {
  //     status: 'success',
  //     data: payment,
  //   };
  // }

  // @Get('payment')
  // async findAllPayments() {
  //   const payments = await this.orderService.findAllPayments();
  //   return {
  //     status: 'success',
  //     data: payments,
  //   };
  // }

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

  // @Post('payment/confirm-bank-transfer')
  // @HttpCode(HttpStatus.OK)
  // @UsePipes(new ValidationPipe({ whitelist: true }))
  // async confirmBankTransfer(@Body() confirmDto: ConfirmBankTransferDto) {
  //   const payment = await this.orderService.confirmBankTransfer(confirmDto);
  //   return {
  //     status: 'success',
  //     data: payment,
  //     message: 'Bank transfer confirmed successfully',
  //   };
  // }

  // SePay Bank Transfer endpoints
  // @Post('payment/sepay/create')
  // @HttpCode(HttpStatus.CREATED)
  // @UsePipes(new ValidationPipe({ whitelist: true }))
  // async createSePayPayment(@Body() createPaymentDto: CreateVNPayPaymentDto) {
  //   const { orderId, amount, description } = createPaymentDto as any;
  //   const payment = await this.sepayService.createPayment(orderId, amount, description);
  //   return {
  //     status: 'success',
  //     data: payment,
  //   };
  // }

  // @Get('payment/sepay/:orderId/status')
  // async checkSePayPaymentStatus(@Param('orderId', ParseIntPipe) orderId: number) {
  //   const status = await this.sepayService.checkPaymentStatus(orderId);
  //   return {
  //     status: 'success',
  //     data: status,
  //   };
  // }

  // @Post('payment/sepay/webhook')
  // @HttpCode(HttpStatus.OK)
  // async handleSePayWebhook(@Body() webhookData: SePayWebhookDto, @Headers('x-sepay-signature') signature: string) {
  //   const result = await this.sepayService.handleWebhook(webhookData, signature);
  //   return result;
  // }

  // VNPAY Payment endpoints
  // @Post('payment/vnpay/create')
  // @HttpCode(HttpStatus.CREATED)
  // @UsePipes(new ValidationPipe({ whitelist: true }))
  // async createVNPayPayment(@Body() createPaymentDto: CreateVNPayPaymentDto) {
  //   const { orderId, amount, description, bankCode } = createPaymentDto;
  //   const payment = await this.vnpayService.createPaymentUrl(orderId, amount, description);
  //   return {
  //     status: 'success',
  //     data: payment,
  //   };
  // }

  // @Get('payment/vnpay/:orderId/status')
  // async checkVNPayPaymentStatus(@Param('orderId', ParseIntPipe) orderId: number) {
  //   const status = await this.vnpayService.checkPaymentStatus(orderId);
  //   return {
  //     status: 'success',
  //     data: status,
  //   };
  // }

  // @Get('payment/vnpay/return')
  // async handleVNPayReturn(@Query() query: VNPayReturnDto) {
  //   const result = await this.vnpayService.handleReturn(query);
  //   return result;
  // }

  // @Post('payment/vnpay/ipn')
  // @HttpCode(HttpStatus.OK)
  // async handleVNPayIPN(@Body() body: VNPayReturnDto) {
  //   const result = await this.vnpayService.handleIPN(body);
  //   return result;
  // }
}
