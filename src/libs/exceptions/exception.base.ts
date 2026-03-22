export interface ResolvableException {
  readonly code: string;
  readonly message: string;
  readonly metadata?: Record<string, unknown>;
}

export function isResolvableException(error: unknown): error is ResolvableException {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}

export interface DomainExceptionProps {
  message: string;
  code: string;
  metadata?: Record<string, unknown>;
}

export abstract class DomainException extends Error implements ResolvableException {
  readonly code: string;
  readonly metadata?: Record<string, unknown>;

  protected constructor(props: DomainExceptionProps) {
    super(props.message);
    this.name = this.constructor.name;
    this.code = props.code;
    this.metadata = props.metadata;
  }
}

export interface ApplicationExceptionProps {
  message: string;
  code: string;
  metadata?: Record<string, unknown>;
}

export abstract class ApplicationException extends Error implements ResolvableException {
  readonly code: string;
  readonly metadata?: Record<string, unknown>;

  protected constructor(props: ApplicationExceptionProps) {
    super(props.message);
    this.name = this.constructor.name;
    this.code = props.code;
    this.metadata = props.metadata;
  }
}
