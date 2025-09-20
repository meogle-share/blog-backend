import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from './base/auditable';

@Entity()
export class DocumentEntity extends Auditable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;
}
