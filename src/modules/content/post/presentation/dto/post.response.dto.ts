import { ApiProperty } from '@nestjs/swagger';
import { ResponseBase } from '@libs/api/response.base';
import { PostModel } from '../../infrastructure/post.model';

export class PostResponseDto extends ResponseBase {
  private constructor(props: {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(props);
    this.title = props.title;
    this.content = props.content;
    this.authorId = props.authorId;
  }

  @ApiProperty({
    description: '게시글 제목',
    example: 'NestJS에서 CQRS 패턴 적용하기',
  })
  readonly title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: 'CQRS 패턴은 Command와 Query를 분리하는 아키텍처 패턴입니다...',
  })
  readonly content: string;

  @ApiProperty({
    description: '작성자 ID',
    example: '01936a7e-8f7e-7890-a5f9-3c8d9b2e1a4c',
  })
  readonly authorId: string;

  static fromModel(model: PostModel): PostResponseDto {
    return new PostResponseDto({
      id: model.id,
      title: model.title,
      content: model.content,
      authorId: model.authorId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
