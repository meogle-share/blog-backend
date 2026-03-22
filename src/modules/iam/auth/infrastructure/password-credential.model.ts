import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { BaseModel } from '@libs/typeorm';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';

@Entity('password_credentials')
export class PasswordCredentialModel extends BaseModel {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  hashedPassword!: string;

  @ManyToOne(() => UserModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: Relation<UserModel>;
}
