// cart.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,
  ) {}

  async addToCart(dto: CreateCartDto) {
    let cartItem = await this.cartRepo.findOne({
      where: {
        user: { id: dto.userId },
        product: { id: dto.productId },
      },
      relations: ['user', 'product'],
    });

    if (cartItem) {
      cartItem.quantity += dto.quantity;
    } else {
      cartItem = this.cartRepo.create({
        user: { id: dto.userId },
        product: { id: dto.productId },
        quantity: dto.quantity,
      });
    }

    return this.cartRepo.save(cartItem);
  }

  async getCartByUser(userId: number) {
    return this.cartRepo.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });
  }

  async updateQuantity(id: number, dto: UpdateCartDto) {
    const item = await this.cartRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = dto.quantity ?? item.quantity;
    return this.cartRepo.save(item);
  }

  async removeItem(id: number) {
    return this.cartRepo.delete(id);
  }

  async clearCart(userId: number) {
    return this.cartRepo.delete({ user: { id: userId } });
  }
}
