import { AbstractEntity } from 'src/database/database.entity';
import { Users } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('address')
export class Address extends AbstractEntity<Address> {
  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column()
  is_default: boolean;

  @ManyToOne(() => Users, (users) => users.address)
  users: Users;
}
