import { ApiProperty } from '@nestjs/swagger';

export class IdResponse {
  constructor(id: string) {
    this.id = id;
  }

  @ApiProperty({ example: '01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c' })
  readonly id: string;

  static from(id: string): IdResponse {
    return new IdResponse(id);
  }
}
