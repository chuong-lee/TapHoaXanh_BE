// cart.controller.ts
import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ICartService } from './interfaces/icart-service.interface';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: ICartService) {}

  @ApiBearerAuth()
  @Post('add')
  @UseGuards(JwtGuard)
  async addToCart(@Req() req: any, @Body() dto: CreateCartDto): Promise<any> {
    const userId = req.user.sub;
    const result = await this.cartService.addToCart(userId, dto.productId, dto.quantity);
    return result;
  }

  @ApiBearerAuth()
  @Get('owned')
  @UseGuards(JwtGuard)
  async getOwnedCart(@Req() req: any): Promise<any> {
    return await this.cartService.FindOrCreateCart(req.user.sub);
  }
}
