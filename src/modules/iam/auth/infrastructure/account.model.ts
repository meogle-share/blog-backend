import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('accounts')
export class AccountModel {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
