import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from './base/auditable';

@Entity()
export class BoardEntity extends Auditable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
