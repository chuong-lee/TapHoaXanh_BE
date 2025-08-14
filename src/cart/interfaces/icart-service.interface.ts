import { Cart } from '../entities/cart.entity';

export abstract class ICartService {
  abstract FindOrCreateCart(userId: number): Promise<Cart>;
  abstract addToCart(userId: number, productId: number, quantity: number): Promise<any>;
}
