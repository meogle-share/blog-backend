import { ApiProperty } from '@nestjs/swagger';

export class HttpErrorResponse {
  @ApiProperty({ example: 400 })
  readonly statusCode: number;

  @ApiProperty({ example: 'COMMON.VALIDATION_ERROR' })
  readonly code: string;

  @ApiProperty({ example: 'Validation failed' })
  readonly message: string;

  @ApiProperty({ example: '2026-03-22T12:00:00.000Z' })
  readonly timestamp: string;

  @ApiProperty({ required: false })
  readonly metadata?: Record<string, unknown>;

  constructor(props: {
    statusCode: number;
    code: string;
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    this.statusCode = props.statusCode;
    this.code = props.code;
    this.message = props.message;
    this.timestamp = new Date().toISOString();
    this.metadata = props.metadata;
  }
}
