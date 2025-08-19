import { AbstractEntity } from 'src/database/database.entity';
import { Users } from 'src/users/entities/users.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { loginType } from 'src/types/common.enum';

@Entity('token')
export class Token extends AbstractEntity<Token> {
  constructor(access: string, refresh: string, user: Users) {
    super();
    this.access_token = access;
    this.refresh_token = refresh;
    this.user = user;
  }

  @Column('varchar', { length: 255 })
  access_token?: string;
  @Column('varchar', { length: 255 })
  refresh_token?: string;
  @Column({ type: 'enum', enum: loginType, default: loginType.EMAIL })
  logintype?: loginType;
  @OneToOne(() => Users, (user) => user.token)
  @JoinColumn({ name: 'user_id' })
  user!: Users;
}
