import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ICartItemService } from './interfaces/icart_item-service.interface';

@Controller('cart-item')
export default class CartItemController {
  constructor(private readonly cartItemService: ICartItemService) {}

  @Get()
  async findAll() {
    return await this.cartItemService.findAll();
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCartItemDto: UpdateCartItemDto) {
  //   return this.cartItemService.update(+id, updateCartItemDto);
  // }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartItemService.remove(+id);
  }
}
