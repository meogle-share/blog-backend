import { ObjectLiteral, Repository } from 'typeorm';

export const truncate = async (repositories: Repository<ObjectLiteral>[]) => {
  for (const repository of repositories) {
    const tableName = repository.metadata.tableName;
    await repository.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
  }
};
