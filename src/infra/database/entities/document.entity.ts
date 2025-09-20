import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
