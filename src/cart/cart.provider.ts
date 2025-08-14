import { Provider } from '@nestjs/common';
import { ICartRepository } from './interfaces/icart-repository.interface';
import { ICartService } from './interfaces/icart-service.interface';
import { CartRepository } from './implements/cart.reposirory';
import { CartService } from './implements/cart.service';

export const CartRepositoryProvider: Provider = {
  provide: ICartRepository,
  useClass: CartRepository,
};

export const CartServiceProvider: Provider = {
  provide: ICartService,
  useClass: CartService,
};
