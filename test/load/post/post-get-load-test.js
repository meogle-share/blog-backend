import http from 'k6/http';
import { check, sleep } from 'k6';

// 게시글 조회 부하테스트 설정
export const options = {
  stages: [
    { duration: '10s', target: 20 },   // 10초 동안 20 VU까지 증가
    { duration: '30s', target: 20 },   // 30초 동안 20 VU 유지
    { duration: '10s', target: 100 },  // 10초 동안 100 VU까지 급증
    { duration: '1m', target: 100 },   // 1분 동안 100 VU 유지 (Read 부하)
    { duration: '10s', target: 0 },    // 10초 동안 0으로 감소
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],      // 95%가 300ms 이하 (Read는 빠름)
    http_req_failed: ['rate<0.01'],        // 에러율 1% 미만
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// 시드 데이터의 고정 게시글 ID (seed.sql과 동일)
const SAMPLE_POST_IDS = [
  '01949000-0002-7000-8001-000000000001',
  '01949000-0002-7000-8001-000000000002',
  '01949000-0002-7000-8001-000000000003',
  '01949000-0002-7000-8001-000000000004',
  '01949000-0002-7000-8001-000000000005',
  '01949000-0002-7000-8001-000000000006',
  '01949000-0002-7000-8001-000000000007',
  '01949000-0002-7000-8001-000000000008',
  '01949000-0002-7000-8001-000000000009',
  '01949000-0002-7000-8001-00000000000a',
  '01949000-0002-7000-8001-00000000000b',
  '01949000-0002-7000-8001-00000000000c',
  '01949000-0002-7000-8001-00000000000d',
  '01949000-0002-7000-8001-00000000000e',
  '01949000-0002-7000-8001-00000000000f',
  '01949000-0002-7000-8001-000000000010',
  '01949000-0002-7000-8001-000000000011',
  '01949000-0002-7000-8001-000000000012',
  '01949000-0002-7000-8001-000000000013',
  '01949000-0002-7000-8001-000000000014',
];

function getRandomPostId() {
  return SAMPLE_POST_IDS[Math.floor(Math.random() * SAMPLE_POST_IDS.length)];
}

// 게시글 조회 시나리오
export default function () {
  const postId = getRandomPostId();

  const response = http.get(`${BASE_URL}/v1/posts/${postId}`);

  check(response, {
    '게시글 조회 성공 (200)': (r) => r.status === 200,
    '제목 존재': (r) => JSON.parse(r.body).title !== undefined,
    '내용 존재': (r) => JSON.parse(r.body).content !== undefined,
    '작성자 정보 존재': (r) => JSON.parse(r.body).authorId !== undefined,
  });

  sleep(0.5); // 사용자 대기 시간 (조회는 더 빠름)
}

export function setup() {
  console.log(`🚀 게시글 조회 부하테스트 시작: ${BASE_URL}`);
  console.log(`📖 시나리오: 게시글 조회 (Read)`);
}