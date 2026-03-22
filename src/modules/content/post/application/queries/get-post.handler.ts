import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostQuery } from './get-post.query';
import { PostResponseDto } from '../../presentation/dto/post.response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostModel } from '../../infrastructure/post.model';
import { Repository } from 'typeorm';
import { PostNotFoundException } from '../exceptions/post-not-found.exception';

@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery, PostResponseDto> {
  constructor(
    @InjectRepository(PostModel)
    private readonly repository: Repository<PostModel>,
  ) {}

  async execute(query: GetPostQuery): Promise<PostResponseDto> {
    const model = await this.repository.findOne({
      where: { id: query.postId },
    });

    if (!model) {
      throw new PostNotFoundException(query.postId);
    }

    return PostResponseDto.fromModel(model);
  }
}
