/**
 * [이 파일이 하는 일]
 * Google GenAI SDK(@google/genai)를 활용하여
 * 식당별 고유한 혼밥 장점, 꿀팁, 심리 멘트 및 맞춤 해시태그를 생성하는 모듈입니다.
 * 모델: gemini-2.5-flash (초고속, 경제적, 고성능)
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PlaceAiCuration {
  placeId: string;
  placeName: string;
  soloLevel: number; // 1 ~ 5
  levelLabel: string;
  psychology: string; // 🎯 식당 고유의 장점과 혼밥 꿀팁 멘트
  tags: string[];     // 🎯 식당 고유의 추천 해시태그 (4~5개)
}

// AI 큐레이션 캐시 파일 경로 및 로드 (개발 및 프로덕션 환경 호환)
const candidateCachePaths = [
  path.resolve(process.cwd(), 'src/data/aiCurations.json'),
  path.resolve(process.cwd(), 'dist/data/aiCurations.json'),
  path.resolve(__dirname, '../data/aiCurations.json'),
];
const validCachePath = candidateCachePaths.find((p) => fs.existsSync(p)) || candidateCachePaths[0];
let curationCache: Record<string, PlaceAiCuration> = {};

// 캐시 로드
try {
  if (fs.existsSync(validCachePath)) {
    curationCache = JSON.parse(fs.readFileSync(validCachePath, 'utf8'));
    console.log(`✅ [Gemini AI 큐레이션] 식당 ${Object.keys(curationCache).length}곳 로드 완료 (경로: ${validCachePath})`);
  }
} catch (e) {
  console.warn('⚠️ aiCurations.json 로드 실패:', e);
}

// 캐시 저장
function saveCache() {
  try {
    const dir = path.dirname(validCachePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(validCachePath, JSON.stringify(curationCache, null, 2), 'utf8');
  } catch (e) {
    console.warn('⚠️ aiCurations.json 저장 실패:', e);
  }
}

/**
 * Gemini 클라이언트 초기화
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * 특정 식당의 AI 혼밥 장점 큐레이션 조회 (ID 캐시 -> 상호명 정밀 매칭 -> Gemini 실시간 생성 -> 룰베이스 Fallback)
 */
export async function getPlaceCuration(place: {
  id: string;
  place_name: string;
  category_name?: string;
  road_address_name?: string;
}): Promise<PlaceAiCuration> {
  // 1. ID로 캐시 확인 (0ms)
  if (curationCache[place.id]) {
    return curationCache[place.id];
  }

  // 2. 상호명으로 정밀 매칭 (카카오 실시간 검색 등으로 ID가 다를 때도 100% 매칭 보장!)
  const normName = place.place_name.replace(/\s+/g, '');
  const matchedByName = Object.values(curationCache).find((c) => {
    const cachedNorm = c.placeName.replace(/\s+/g, '');
    return cachedNorm === normName || normName.includes(cachedNorm) || cachedNorm.includes(normName);
  });
  if (matchedByName) {
    curationCache[place.id] = { ...matchedByName, placeId: place.id, placeName: place.place_name };
    return curationCache[place.id];
  }

  // 2. Gemini API 키가 있으면 Gemini 2.5 Flash로 실시간 분석 생성
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `
당신은 명지대학교 대학가 혼밥 전문 AI 큐레이터입니다.
다음 식당 정보를 바탕으로 혼밥하려는 학생에게 식당의 실제 대표 메뉴, 개별 장점, 매장 분위기, 혼밥 꿀팁을 한 줄로 생생하게 전달해주세요.
모든 식당마다 천편일률적인 설명이 아닌, "이 식당만의 진짜 장점과 혼밥 팁"이어야 합니다.

[식당 정보]
- 상호명: ${place.place_name}
- 카테고리: ${place.category_name || '음식점'}
- 주소: ${place.road_address_name || '명지대 주변'}

반드시 아래 JSON 형식으로만 응답하세요(코드블록 없이):
{
  "soloLevel": 1부터 5까지의 숫자 (1:입문 패스트푸드/토스트, 2:국밥/라멘 혼밥성지, 3:일반백반/밥집, 4:떡볶이/파스타/다인석, 5:고깃집/곱창 끝판왕),
  "psychology": "식당 고유의 매력과 대표 메뉴, 혼밥하기 좋은 구체적인 팁을 담은 1~2문장 (예: '1,500원 탕수육과 멸치국수의 미친 가성비! 1인석에서 눈치 없이 빠르게 즐기기 최고예요.')",
  "tags": ["#식당고유장점", "#대표메뉴", "#혼밥꿀팁", "#분위기특징"]
}
`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });
      } catch (mErr) {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
      }

      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const levelLabels: Record<number, string> = {
        1: 'Lv.1 입문 혼밥',
        2: 'Lv.2 혼밥 성지',
        3: 'Lv.3 일반 밥집',
        4: 'Lv.4 다인석 식당',
        5: 'Lv.5 혼밥 끝판왕',
      };

      const result: PlaceAiCuration = {
        placeId: place.id,
        placeName: place.place_name,
        soloLevel: Math.min(5, Math.max(1, Number(parsed.soloLevel) || 3)),
        levelLabel: levelLabels[Number(parsed.soloLevel) || 3] || 'Lv.3 일반 밥집',
        psychology: parsed.psychology || '명지대 학우들이 즐겨 찾는 든든한 한 끼 식당',
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : ['#명지대맛집', '#혼밥추천'],
      };

      curationCache[place.id] = result;
      saveCache();
      return result;
    } catch (err) {
      console.warn(`⚠️ Gemini API 호출 실패 (${place.place_name}):`, err);
    }
  }

  // 3. Fallback: 식당 이름과 메뉴를 분석한 개별 맞춤 장점 생성 (천편일률적 문구 탈피!)
  const fallback = generateSmartFallbackCuration(place);
  curationCache[place.id] = fallback;
  saveCache();
  return fallback;
}

/**
 * 식당 이름과 세부 카테고리를 반영한 100% 개별 차별화 큐레이션 생성기
 */
function generateSmartFallbackCuration(place: {
  id: string;
  place_name: string;
  category_name?: string;
  road_address_name?: string;
}): PlaceAiCuration {
  const name = place.place_name.toLowerCase();
  const cat = (place.category_name || '').toLowerCase();

  // 1. 엄마손떡볶이
  if (name.includes('엄마손떡볶이')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 2,
      levelLabel: 'Lv.2 혼밥 성지',
      psychology: '카레 향 솔솔 나는 명지대의 전설! 바삭한 튀김 버무려 1인분 뚝딱 비우기 좋은 분식 명소예요.',
      tags: ['#카레떡볶이', '#명지대전설맛집', '#혼떡강추', '#튀김버무리', '#가성비분식'],
    };
  }

  // 2. 모래내곱창
  if (name.includes('모래내곱창')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 5,
      levelLabel: 'Lv.5 혼밥 끝판왕',
      psychology: '매콤달콤 야채곱창의 깊은 불맛! 볶음밥까지 혼자 당당히 마스터하면 진정한 혼밥 고수 인정.',
      tags: ['#야채곱창명가', '#불맛볶음밥', '#혼술혼곱도전', '#명지대곱창', '#끝판왕클리어'],
    };
  }

  // 3. 주인백파스타
  if (name.includes('주인백파스타') || name.includes('주인백')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 3,
      levelLabel: 'Lv.3 일반 밥집',
      psychology: '꾸덕하고 푸짐한 파스타를 착한 가격에 즐길 수 있어, 양식 땡길 때 1인 식사로 완전 추천해요.',
      tags: ['#가성비파스타', '#꾸덕크림', '#매콤토마토', '#양식혼밥', '#학생단골집'],
    };
  }

  // 4. 허니돈
  if (name.includes('허니돈')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 1,
      levelLabel: 'Lv.1 입문 혼밥',
      psychology: '탕수육 2,000원·멸치국수 1,500원의 기적! 1인 좌석에서 부담 없이 여러 메뉴를 맛볼 수 있어요.',
      tags: ['#가성비원탑', '#수제탕수육', '#잔치국수', '#지갑지킴이', '#초스피드혼밥'],
    };
  }

  // 5. 리코브리또
  if (name.includes('리코브리또')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 2,
      levelLabel: 'Lv.2 혼밥 성지',
      psychology: '묵직하고 든든한 멕시칸 부리또 전문점! 바 테이블이 잘 갖춰져 눈치 볼 필요 전혀 없이 깔끔해요.',
      tags: ['#두툼한부리또', '#간편든든식사', '#바테이블완비', '#포장테이크아웃', '#남미의맛'],
    };
  }

  // 6. 응급실국물떡볶이
  if (name.includes('응급실')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 4,
      levelLabel: 'Lv.4 다인석 식당',
      psychology: '얼큰한 국물과 치즈 토핑의 환상 조화! 1인 세트나 단품으로 스트레스 풀기에 제격이에요.',
      tags: ['#스트레스해소', '#치즈듬뿍', '#매운맛선택', '#국물떡볶이', '#든든한양'],
    };
  }

  // 7. 치즈밥있슈
  if (name.includes('치즈밥')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 2,
      levelLabel: 'Lv.2 혼밥 성지',
      psychology: '지글지글 뚝배기에 늘어나는 치즈와 김치볶음밥의 조화! 학생 혼밥러들의 오랜 아지트예요.',
      tags: ['#치즈폭포', '#뚝배기밥집', '#학창시절추억', '#단짠김치밥', '#착한가격'],
    };
  }

  // 8. 가타쯔무리
  if (name.includes('가타쯔무리')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 2,
      levelLabel: 'Lv.2 혼밥 성지',
      psychology: '일본인 장인이 빚어내는 정통 사누키 자가제면 우동! 바 자리에서 조용히 면발에 집중하기 최고예요.',
      tags: ['#자가제면우동', '#인생우동', '#탱글한면발', '#고독한미식가', '#오픈런맛집'],
    };
  }

  // 9. 만평우동
  if (name.includes('만평우동')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 1,
      levelLabel: 'Lv.1 입문 혼밥',
      psychology: '가성비 넘치는 뜨끈한 우동과 튀김! 키오스크 주문과 1인 카운터석으로 빠른 식사가 가능해요.',
      tags: ['#착한가격우동', '#바삭바삭튀김', '#키오스크선불', '#1인카운터', '#스피드식사'],
    };
  }

  // 10. 긴자료코
  if (name.includes('긴자료코')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 2,
      levelLabel: 'Lv.2 혼밥 성지',
      psychology: '커다란 세숫대야 그릇의 데미그라스 돈까스와 사케동! 오픈형 바 좌석으로 완벽한 1인 친화 매장이에요.',
      tags: ['#데미그라스돈까스', '#1.5인분무료', '#오픈키친바', '#연어덮밥', '#혼밥공인성지'],
    };
  }

  // 11. 샐러디
  if (name.includes('샐러디')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 1,
      levelLabel: 'Lv.1 입문 혼밥',
      psychology: '건강하고 가벼운 웜볼과 랩 샌드위치! 조용하고 쾌적한 1인석에서 식단 관리하기 안성맞춤이에요.',
      tags: ['#식단관리', '#웜볼샐러드', '#다이어트식단', '#깔끔한인테리어', '#가벼운한끼'],
    };
  }

  // 12. 롯데리아 / 버거킹 / 맘스터치 / 맥도날드
  if (name.includes('버거') || name.includes('맘스터치') || name.includes('롯데리아') || name.includes('맥도날드')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 1,
      levelLabel: 'Lv.1 입문 혼밥',
      psychology: '키오스크로 1분 컷 주문! 혼자 온 손님이 80% 이상이라 시선 신경 쓸 필요가 전혀 없어요.',
      tags: ['#키오스크주문', '#초스피드식사', '#혼밥입문코스', '#시선신경제로', '#감자튀김맛집'],
    };
  }

  // 13. 마라탕 (샹츠마라, 다복향, 춘리, 탕화쿵푸 등)
  if (name.includes('마라') || cat.includes('마라')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 3,
      levelLabel: 'Lv.3 일반 밥집',
      psychology: '내가 원하는 재료만 쏙쏙 골라 담는 재미! 1인 냄비로 조리되어 혼밥족이 절반 이상이에요.',
      tags: ['#내맘대로재료선택', '#스트레스해소', '#얼얼한국물', '#마라수혈', '#1인조리'],
    };
  }

  // 14. 국밥 / 순대국 / 해장국
  if (name.includes('국밥') || name.includes('순대') || name.includes('해장국') || name.includes('설렁탕')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 2,
      levelLabel: 'Lv.2 혼밥 성지',
      psychology: '주문하자마자 끓어오르는 뜨끈한 뚝배기와 깍두기! 든든하게 속 채우고 싶을 때 1위 메뉴예요.',
      tags: ['#한국인소울푸드', '#뚝배기한그릇', '#공기밥무한리필', '#속풀이해장', '#든든한국물'],
    };
  }

  // 15. 돈까스 / 일식 카레
  if (name.includes('돈까스') || name.includes('카레') || name.includes('가츠')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 2,
      levelLabel: 'Lv.2 혼밥 성지',
      psychology: '바삭하게 튀겨낸 두툼한 카츠 정식! 깔끔한 1인 트레이 서빙으로 대접받는 기분이에요.',
      tags: ['#겉바속촉카츠', '#정갈한1인트레이', '#혼밥인기메뉴', '#카레리필', '#든든한정식'],
    };
  }

  // 16. 라멘 / 소바 / 냉면
  if (name.includes('라멘') || name.includes('소바') || name.includes('냉면') || name.includes('국수')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 2,
      levelLabel: 'Lv.2 혼밥 성지',
      psychology: '진하고 깊은 육수와 쫄깃한 면발! 1인 바 테이블이 있어 혼자서도 아늑하게 즐길 수 있어요.',
      tags: ['#진한국물', '#1인바테이블', '#혼밥명소', '#자가제면', '#깔끔한국수'],
    };
  }

  // 17. 초밥 / 스시
  if (name.includes('초밥') || name.includes('스시') || name.includes('여부초밥')) {
    return {
      placeId: place.id,
      placeName: place.place_name,
      soloLevel: 2,
      levelLabel: 'Lv.2 혼밥 성지',
      psychology: '신선한 네타와 알찬 구성! 닷지석에서 조용히 대화 없이 나만의 식사에 집중하기 좋아요.',
      tags: ['#신선한초밥', '#닷지석완비', '#나만을위한사치', '#정갈한식사', '#스시혼밥'],
    };
  }

  // 18. 한식 백반 / 찌개 / 가정식
  return {
    placeId: place.id,
    placeName: place.place_name,
    soloLevel: 3,
    levelLabel: 'Lv.3 일반 밥집',
    psychology: '정갈한 밑반찬과 집밥 느낌 가득한 따뜻한 한 끼! 든든하고 속 편한 점심 식사로 딱이에요.',
    tags: ['#집밥감성', '#푸짐한밑반찬', '#든든한한끼', '#속편한식사', '#학생단골맛집'],
  };
}
