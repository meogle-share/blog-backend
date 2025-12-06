import { JoinColumn } from 'typeorm';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserModel } from '../../../iam/user/infrastructure/user.model';
import type { Relation } from 'typeorm';
import { BaseModel } from '@libs/typeorm';

@Entity('posts')
export class PostModel extends BaseModel {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column('uuid')
  authorId: string;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'authorId' })
  author?: Relation<UserModel>;
}
