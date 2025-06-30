import { Address } from 'src/address/entities/address.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { AbstractEntity } from 'src/database/database.entity';
import { Order } from 'src/order/entities/order.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Rating } from 'src/rating/entities/rating.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';
import { Wishlist } from 'src/wishlist/entities/wishlist.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('users')
export class Users extends AbstractEntity<Users> {
  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  image: string;

  @Column()
  role: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Address, (address) => address.users)
  address: Address[];
  @OneToMany(() => Voucher, (voucher) => voucher.users)
  voucher: Voucher[];
  @OneToMany(() => Order, (order) => order.users)
  order: Order[];
  @OneToMany(() => Payment, (payment) => payment.users)
  payment: Payment[];
  @OneToMany(() => Rating, (rating) => rating.users)
  rating: Rating[];
  @OneToMany(() => Wishlist, (wishlist) => wishlist.users)
  wishlist: Wishlist[];
  @OneToMany(() => Cart, (cart) => cart.user)
  cart: Cart[];

}
