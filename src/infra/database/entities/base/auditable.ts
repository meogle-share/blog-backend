import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class Auditable {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
