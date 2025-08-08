// cart.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Cart } from '../entities/cart.entity';
import { ICartService } from '../interfaces/icart-service.interface';
import { ICartRepository } from '../interfaces/icart-repository.interface';
import { ICartItemService } from 'src/cart_item/interfaces/icart_item-service.interface';

@Injectable()
export class CartService implements ICartService {
  constructor(
    @Inject(ICartRepository)
    private _cartRepository: ICartRepository,
    @Inject(ICartItemService)
    private _cartItemService: ICartItemService,
  ) {}

  async FindOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this._cartRepository.findCartByUserId(userId);
    if (!cart) {
      cart = await this._cartRepository.createCart(userId);
    }
    return cart;
  }

  async addToCart(userId: number, productId: number, quantity: number) {
    const cart = await this.FindOrCreateCart(userId);
    // 2. Gọi CartItemService để xử lý logic cart item
    cart && (await this._cartItemService.addOrUpdateCartItem(cart, productId, quantity));
    const result = await this._cartRepository.findCartByUserId(userId);
    return result;
  }
}
