import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICartItemService } from '../interfaces/icart_item-service.interface';
import { CartItem } from '../entities/cart_item.entity';
import { ICartItemRepository } from '../interfaces/icart_item-repository.interface';
import { Cart } from 'src/cart/entities/cart.entity';
import { ProductRepository } from 'src/products/products.repository';

@Injectable()
export class CartItemService implements ICartItemService {
  constructor(
    @Inject(ICartItemRepository)
    private readonly _cartItemRepository: ICartItemRepository,
    @Inject(ProductRepository)
    private readonly _productRepository: ProductRepository,
  ) {}

  async addOrUpdateCartItem(cart: Cart, productId: number, quantity: number): Promise<CartItem> {
    // Validate quantity - bắt lỗi khi quantity = 0
    if (quantity <= 0) {
      throw new BadRequestException('Số lượng phải lớn hơn 0');
    }

    // Validate product exists - bắt lỗi khi product không tồn tại
    const product = await this._productRepository.findOne(productId);
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }
    const existingCartItem = await this._cartItemRepository.findByCartAndProduct(cart.id, productId);
    // Validate stock - bắt lỗi khi quantity không đủ
    if (product.quantity < quantity) {
      throw new BadRequestException(
        `Số lượng sản phẩm trong kho không đủ. Hiện có: ${product.quantity}, yêu cầu: ${quantity}`,
      );
    }

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      // Xác nhận tổng số lượng không vượt product có sẵn
      if (newQuantity > product.quantity) {
        throw new BadRequestException(
          `Tổng số lượng vượt quá số lượng trong kho. Hiện có: ${product.quantity}, yêu cầu: ${newQuantity}`,
        );
      }

      existingCartItem.quantity = newQuantity;
      existingCartItem.price = product.price;
      existingCartItem.total_price = product.price * newQuantity;

      return this._cartItemRepository.save(existingCartItem);
    }
    // thêm cart item đó vào

    const newCartItem = new CartItem(cart, quantity, product.price, product);
    newCartItem.total_price = product.price * quantity;

    return this._cartItemRepository.save(newCartItem);
  }
  async findAll(): Promise<CartItem[]> {
    return this._cartItemRepository.findAll();
  }
  async remove(id: number): Promise<void> {
    const cartItem = await this._cartItemRepository.findOne(id);
    if (!cartItem) {
      throw new NotFoundException('Cart item không tồn tại');
    }
    await this._cartItemRepository.remove(cartItem);
  }
}
