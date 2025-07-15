import { AbstractEntity } from 'src/database/database.entity';
import { Order } from 'src/order/entities/order.entity';
import { Users } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  source?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  payment_method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @ManyToOne(() => Users, (user) => user.payments)
  @JoinColumn()
  user: Users;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn()
  order: Order;
}
