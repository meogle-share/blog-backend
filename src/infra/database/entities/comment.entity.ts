import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from './base/auditable';

@Entity()
export class CommentEntity extends Auditable {
  @PrimaryGeneratedColumn()
  id: number;
}
