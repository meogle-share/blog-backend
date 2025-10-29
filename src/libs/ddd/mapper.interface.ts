import { Entity } from '@libs/ddd/entity.base';

/**
 * Mapper는 서로 다른 레이어에서 사용되는 객체들을 변환합니다.
 * - Record: 데이터베이스에 저장되는 객체
 * - Entity: 애플리케이션 도메인 레이어에서 사용되는 객체
 * - ResponseDTO: 사용자에게 반환되는 객체 (보통 JSON 형태)
 */
export interface Mapper<DomainEntity extends Entity<any>, DbRecord, Response = any> {
  toModel(entity: DomainEntity): DbRecord;
  toDomain(record: any): DomainEntity;
  toResponse?(entity: DomainEntity): Response;
}
