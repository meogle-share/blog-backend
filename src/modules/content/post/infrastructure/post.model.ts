import { JoinColumn } from 'typeorm';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserModel } from '../../../iam/user/infrastructure/user.model';
import type { Relation } from 'typeorm';

@Entity('posts')
export class PostModel {
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

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  static from(data: {
    id: string;
    authorId: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }): PostModel {
    const model = new PostModel();
    Object.assign(model, data);
    return model;
  }
}
