import { CartItem } from '../entities/cart_item.entity';

export abstract class ICartItemRepository {
  abstract findByCartAndProduct(cartId: number, productId: number): Promise<CartItem | null>;
  abstract save(cartItem: CartItem): Promise<CartItem>;
  abstract remove(cartItem: CartItem): Promise<void>;
  abstract findOne(id: number): Promise<CartItem | null>;
  abstract resetAutoIncrement(): Promise<void>;
  abstract findAll(): Promise<CartItem[]>;
}
