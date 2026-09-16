const fs = require('fs');
const path = require('path');

const daedongPath = path.join(__dirname, '../src/data/daedongPlaces.json');
const raw = fs.readFileSync(daedongPath, 'utf8');
const places = JSON.parse(raw);

console.log('Total places in daedongPlaces.json:', places.length);

const issues = [];

places.forEach(p => {
  const kakaoUrl = p.place_url;
  const name = p.place_name;
  const roadAddr = p.road_address_name || '';
  const addr = p.address_name || '';

  // Kakao URL check
  if (!kakaoUrl || !kakaoUrl.startsWith('http')) {
    issues.push({ id: p.id, name, type: 'KAKAO_URL_MISSING', kakaoUrl });
  }

  // Branch suffix check that commonly causes Naver search failure:
  // e.g. "마라왕 명지점", "OOO 명지대점", "OOO 서대문점", "OOO 본점"
  const branchRegex = /(명지점|명지대점|명지인문점|서대문점|홍은점|남가좌점|가좌점|신촌점|1호점|2호점)$/;
  if (branchRegex.test(name.trim())) {
    issues.push({ id: p.id, name, roadAddr, type: 'HAS_BRANCH_SUFFIX', cleanName: name.replace(branchRegex, '').trim() });
  }
});

console.log('Issues found:', issues.length);
console.log(JSON.stringify(issues, null, 2));
