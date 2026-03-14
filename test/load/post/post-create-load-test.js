import http from 'k6/http';
import { check, sleep } from 'k6';

// 게시글 생성 부하테스트 설정
export const options = {
  stages: [
    { duration: '10s', target: 10 },  // 10초 동안 10 VU까지 증가
    { duration: '30s', target: 10 },  // 30초 동안 10 VU 유지
    { duration: '10s', target: 30 },  // 10초 동안 30 VU까지 증가
    { duration: '1m', target: 30 },   // 1분 동안 30 VU 유지 (Write 부하)
    { duration: '10s', target: 0 },   // 10초 동안 0으로 감소
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],      // 95%가 800ms 이하 (Write는 느림)
    http_req_failed: ['rate<0.05'],        // 에러율 5% 미만
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// 시드 데이터의 고정 사용자 ID (seed.sql과 동일)
const SAMPLE_USER_IDS = [
  '01949000-0001-7000-8001-000000000001',
  '01949000-0001-7000-8001-000000000002',
  '01949000-0001-7000-8001-000000000003',
  '01949000-0001-7000-8001-000000000004',
  '01949000-0001-7000-8001-000000000005',
  '01949000-0001-7000-8001-000000000006',
  '01949000-0001-7000-8001-000000000007',
  '01949000-0001-7000-8001-000000000008',
  '01949000-0001-7000-8001-000000000009',
  '01949000-0001-7000-8001-00000000000a',
];

function getRandomUserId() {
  return SAMPLE_USER_IDS[Math.floor(Math.random() * SAMPLE_USER_IDS.length)];
}

// 게시글 생성 시나리오
export default function () {
  const payload = JSON.stringify({
    authorId: getRandomUserId(),
    title: `부하테스트 게시글 ${Date.now()}`,
    content: `부하테스트용 게시글 내용입니다. 생성 시각: ${new Date().toISOString()}. ` +
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ` +
      `Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
  });

  const response = http.post(`${BASE_URL}/v1/posts`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(response, {
    '게시글 생성 성공 (201)': (r) => r.status === 201,
    '게시글 ID 반환': (r) => JSON.parse(r.body).id !== undefined,
  });

  sleep(1); // 사용자 대기 시간
}

export function setup() {
  console.log(`🚀 게시글 생성 부하테스트 시작: ${BASE_URL}`);
  console.log(`📝 시나리오: 게시글 생성 (Write)`);
}