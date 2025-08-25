import { Injectable } from '@nestjs/common';
import { ICartItemRepository } from '../interfaces/icart_item-repository.interface';
import { CartItem } from '../entities/cart_item.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CartItemRepository implements ICartItemRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly _cartItemRepository: Repository<CartItem>,
    private readonly dataSource: DataSource,
  ) {}
  async findByCartAndProduct(cartId: number, productId: number): Promise<CartItem | null> {
    return this._cartItemRepository.findOne({
      where: { cart: { id: cartId }, product_variant: { id: productId } },
      relations: ['cart', 'product_variant'],
    });
  }
  async save(cartItem: CartItem): Promise<CartItem> {
    return this._cartItemRepository.save(cartItem);
  }
  async remove(cartItem: CartItem): Promise<void> {
    await this._cartItemRepository.remove(cartItem);
    await this.resetAutoIncrement();
  }
  async findOne(id: number): Promise<CartItem | null> {
    return this._cartItemRepository.findOne({
      where: { id },
      relations: ['cart', 'product_variant'],
    });
  }
  async findAll(): Promise<CartItem[]> {
    return this._cartItemRepository.find({
      relations: ['cart', 'product_variant'],
    });
  }
  async resetAutoIncrement(): Promise<void> {
    await this.dataSource.query('ALTER TABLE cart_item AUTO_INCREMENT = 1');
  }
}
