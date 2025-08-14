import { Provider } from '@nestjs/common';
import { ICartItemRepository } from './interfaces/icart_item-repository.interface';
import { ICartItemService } from './interfaces/icart_item-service.interface';
import { CartItemService } from './implements/cart_item.service';
import { CartItemRepository } from './implements/cart_item-repository';

export const CartItemRepositoryProvider: Provider = {
  provide: ICartItemRepository,
  useClass: CartItemRepository,
};

export const CartItemServiceProvider: Provider = {
  provide: ICartItemService,
  useClass: CartItemService,
};
