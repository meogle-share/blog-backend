import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class UserModel {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  static from(data: { [K in keyof UserModel]: UserModel[K] }): UserModel {
    return Object.assign(new UserModel(), data);
  }
}
