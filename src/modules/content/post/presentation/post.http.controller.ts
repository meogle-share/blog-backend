import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { CreatePostRequestDto } from './dto/create-post.request.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/commands/create-post.command';
import { routesV1 } from '@configs/app.routes';
import { IdResponse } from '@libs/api/id.response.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller(routesV1.version)
export class PostHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: '게시글 생성' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: IdResponse,
  })
  @Post(routesV1.user.root)
  async createPost(@Body() dto: CreatePostRequestDto): Promise<IdResponse> {
    const command = new CreatePostCommand(dto.authorId, dto.title, dto.content);
    const post = await this.commandBus.execute(command);
    return IdResponse.from(post.getProps().id);
  }
}
