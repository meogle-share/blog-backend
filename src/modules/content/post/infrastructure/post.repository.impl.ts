import { IPostRepository } from '../domain/post.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { PostModel } from './post.model';
import { Repository } from 'typeorm';
import { Post } from '../domain/post.aggregate';
import { PostMapper } from './post.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostRepositoryImpl implements IPostRepository {
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
