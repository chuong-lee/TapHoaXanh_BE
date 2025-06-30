import { Brand } from 'src/brand/entities/brand.entity';
import { CartItem } from 'src/cart_item/entities/cart_item.entity';
import { Category } from 'src/category/entities/category.entity';
import { AbstractEntity } from 'src/database/database.entity';
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { ProductImage } from 'src/product-images/entities/product-image.entity';
import { ProductVariant } from 'src/product-variant/entities/product-variant.entity';
import { Rating } from 'src/rating/entities/rating.entity';
import { Wishlist } from 'src/wishlist/entities/wishlist.entity';
import { CategoryChild } from '../../category-child/entities/category-child.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Cart } from 'src/cart/entities/cart.entity';

import { JoinColumn } from 'typeorm';

@Entity('product')
export class Product extends AbstractEntity<Product> {
  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  discount: number;

  @Column()
  images: string;

  @Column()
  slug: string;

  @Column({ unique: true })
  barcode: string;

  @Column()
  expiry_date: Date;

  @Column()
  origin: string;

  @Column()
  weight_unit: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  quantity: number;

  @Column({ default: 0 })
  purchase: number;

  @ManyToOne(() => Category, (category) => category.product)
  category: Category;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  
  @OneToMany(() => Cart, (cart) => cart.product)
  carts: Cart[];

  @OneToMany(() => ProductImage, (image) => image.product)
  image: ProductImage;

  @ManyToOne(() => Brand, (brand) => brand.product)
  brand: Brand;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItem: OrderItem[];

  @OneToMany(() => Rating, (rating) => rating.product)
  rating: Rating[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlist: Wishlist[];

  @OneToMany(() => CartItem, (item) => item.cart)
  cartItems: CartItem[];

  @ManyToOne(() => CategoryChild, (child) => child.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_childId' })
  category_child: CategoryChild;
}
