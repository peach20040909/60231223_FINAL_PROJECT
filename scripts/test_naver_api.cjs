const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testApi() {
  const q1 = encodeURIComponent('마라왕 명지점');
  const q2 = encodeURIComponent('마라왕');
  const q3 = encodeURIComponent('마라왕마라탕');
  
  // Try querying Naver map search API directly
  try {
    const res = await fetch(`https://map.naver.com/p/api/search/allSearch?query=${q1}&type=all&searchCoord=126.9240;37.5845&boundary=`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('q1 result count:', data.result?.place?.totalCount || 0);
  } catch (e) {
    console.error('API err:', e.message);
  }
}

testApi();
