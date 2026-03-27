import { HttpStatus } from '@nestjs/common';
import { CommonErrorCode } from '../common-error-code';
import { IamErrorCode } from '@modules/iam/error-codes';
import { ContentErrorCode } from '@modules/content/error-codes';

const EXCEPTION_CODE_TO_HTTP_STATUS: Record<string, HttpStatus> = {
  [CommonErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [CommonErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [CommonErrorCode.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [CommonErrorCode.CONFLICT]: HttpStatus.CONFLICT,
  [CommonErrorCode.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [IamErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
  [IamErrorCode.TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [IamErrorCode.TOKEN_INVALID]: HttpStatus.UNAUTHORIZED,
  [IamErrorCode.INVALID_ACCOUNT]: HttpStatus.BAD_REQUEST,
  [IamErrorCode.INVALID_USER]: HttpStatus.BAD_REQUEST,
  [ContentErrorCode.INVALID_POST]: HttpStatus.BAD_REQUEST,
  [ContentErrorCode.POST_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [CommonErrorCode.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
};

export function toHttpStatus(code: string): HttpStatus {
  return EXCEPTION_CODE_TO_HTTP_STATUS[code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
}
