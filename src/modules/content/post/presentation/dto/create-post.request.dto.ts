import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostTitle } from '../../domain/value-objects/post-title.vo';
import { PostContent } from '../../domain/value-objects/post-content.vo';

export class CreatePostRequestDto {
  @ApiProperty({
    description: '작성자 ID',
    example: '01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c',
  })
  @IsUUID(7)
  @IsNotEmpty()
  authorId: string;

  @ApiProperty({
    description: '게시글 제목',
    example: 'DDD 패턴으로 블로그 만들기',
  })
  @IsString()
  @IsNotEmpty()
  @Length(PostTitle.MIN_LENGTH, PostTitle.MAX_LENGTH)
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '<p>개발은 재밌어...</p>',
  })
  @IsString()
  @IsNotEmpty()
  @Length(PostContent.MIN_LENGTH, PostContent.MAX_LENGTH)
  content: string;
}
