import { PostRepositoryPort } from '../domain/ports/post.repository.port';
import { InjectRepository } from '@nestjs/typeorm';
import { PostModel } from './post.model';
import { Repository } from 'typeorm';
import { Post } from '../domain/models/post.aggregate';
import { PostMapper } from './post.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostRepositoryImpl implements PostRepositoryPort {
  constructor(
    @InjectRepository(PostModel)
    private readonly repository: Repository<PostModel>,
    private readonly mapper: PostMapper,
  ) {}

  async save(post: Post): Promise<Post> {
    const model = await this.repository.save(this.mapper.toModel(post));
    return this.mapper.toDomain(model);
  }
}
