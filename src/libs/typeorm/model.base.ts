import { Column } from 'typeorm';

type ModelData<T> = {
  [K in keyof T as T[K] extends (...args: unknown[]) => unknown ? never : K]: T[K];
};

export abstract class BaseModel {
  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  static from<T extends BaseModel>(this: new () => T, data: ModelData<T>): T {
    return Object.assign(new this(), data);
  }
}
