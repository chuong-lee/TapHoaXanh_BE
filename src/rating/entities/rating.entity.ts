import { AbstractEntity } from '../../database/database.entity';
import { Product } from '../../products/entities/product.entity';
import { Users } from '../../users/entities/users.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum RatingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum RatingModerationReason {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SPAM = 'spam',
  OFFENSIVE_LANGUAGE = 'offensive_language',
  FALSE_INFORMATION = 'false_information',
  OTHER = 'other'
}

export enum RatingFlagReason {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SPAM = 'spam',
  OFFENSIVE_LANGUAGE = 'offensive_language',
  FALSE_INFORMATION = 'false_information',
  HARASSMENT = 'harassment',
  OTHER = 'other'
}

@Entity('rating')
export class Rating extends AbstractEntity<Rating> {
  @Column({ nullable: true })
  comment?: string;

  @Column()
  rating!: number;

  @Column({
    type: 'enum',
    enum: RatingStatus,
    default: RatingStatus.PENDING
  })
  status!: RatingStatus;

  @Column({ nullable: true })
  moderation_note?: string;

  @Column({
    type: 'enum',
    enum: RatingModerationReason,
    nullable: true
  })
  moderation_reason?: RatingModerationReason;

  @Column({ nullable: true })
  moderated_by?: number;

  @Column({ nullable: true })
  moderated_at?: Date;

  @Column({ default: false })
  is_flagged!: boolean;

  @Column({
    type: 'enum',
    enum: RatingFlagReason,
    nullable: true
  })
  flag_reason?: RatingFlagReason;

  @Column({ nullable: true })
  flag_note?: string;

  @Column({ nullable: true })
  flagged_by?: number;

  @Column({ nullable: true })
  flagged_at?: Date;

  @Column({ default: 0 })
  flag_count!: number;

  @ManyToOne(() => Users, (users) => users.rating)
  @JoinColumn({ name: 'user_id' })
  users!: Users;

  @ManyToOne(() => Product, (product) => product.rating)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
