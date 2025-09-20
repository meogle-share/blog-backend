import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from './base/auditable';

@Entity()
export class UserEntity extends Auditable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ select: false })
  salt: string;
}
