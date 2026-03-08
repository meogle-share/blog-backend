export interface RepositoryPort<Entity> {
  create(entity: Entity): Promise<void>;
  update(entity: Entity): Promise<void>;
  findOneById(id: string): Promise<Entity | null>;
  delete(entity: Entity): Promise<void>;
}
