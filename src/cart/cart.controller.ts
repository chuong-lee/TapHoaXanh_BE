// cart.controller.ts
import {
  Controller, Post, Body, Get, Param, Patch, Delete,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  add(@Body() dto: CreateCartDto) {
    return this.cartService.addToCart(dto);
  }

  @Get(':userId')
  getCart(@Param('userId') userId: number) {
    return this.cartService.getCartByUser(userId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateCartDto) {
    return this.cartService.updateQuantity(id, dto);
  }

  @Delete(':id')
  deleteItem(@Param('id') id: number) {
    return this.cartService.removeItem(id);
  }

  @Delete('clear/:userId')
  clear(@Param('userId') userId: number) {
    return this.cartService.clearCart(userId);
  }
}
