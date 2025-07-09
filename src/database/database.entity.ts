import { BaseEntity, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class AbstractEntity<T> extends BaseEntity {
  @PrimaryGeneratedColumn() // id tự đông tăng
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;
}
