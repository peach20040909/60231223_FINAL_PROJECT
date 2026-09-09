import 'dotenv/config';
import { searchPlacesByKeyword, MYONGJI_SEOUL_COORDS } from './src/lib/kakao.js';

async function main() {
  console.log('==================================================');
  console.log('🍽️  카카오 로컬 API 검색 테스트 (명지대 인문캠퍼스)');
  console.log('==================================================');
  console.log(`API 키: ${process.env.KAKAO_REST_API_KEY?.slice(0, 6)}...`);
  console.log(`기준 위치: ${MYONGJI_SEOUL_COORDS.name} (${MYONGJI_SEOUL_COORDS.address})`);
  console.log(`좌표: 경도(x)=${MYONGJI_SEOUL_COORDS.x}, 위도(y)=${MYONGJI_SEOUL_COORDS.y}`);

  // 명지대 인문캠퍼스 반경 1km(1000m) 내의 혼밥 식당 거리순 검색
  const result = await searchPlacesByKeyword('혼밥', {
    x: MYONGJI_SEOUL_COORDS.x,
    y: MYONGJI_SEOUL_COORDS.y,
    radius: 1000,
    sort: 'distance',
    size: 5,
  });

  console.log(`\n인문캠퍼스 반경 1km 내 검색된 식당 수: ${result.meta.total_count}개`);
  console.log('--------------------------------------------------');

  result.documents.forEach((place, index) => {
    console.log(`[${index + 1}] ${place.place_name} (${place.category_name})`);
    console.log(`    - 도로명주소: ${place.road_address_name || place.address_name}`);
    console.log(`    - 거리: 캠퍼스로부터 약 ${place.distance || '0'}m`);
    console.log(`    - 전화번호: ${place.phone || '없음'}`);
    console.log(`    - 카카오맵 링크: ${place.place_url}`);
  });
  console.log('--------------------------------------------------');
  console.log('✅ 명지대 인문캠퍼스 주변 식당 검색이 성공적으로 완료되었습니다!\n');
}

main().catch((err) => {
  console.error('테스트 실패 에러:', err);
  process.exit(1);
});
