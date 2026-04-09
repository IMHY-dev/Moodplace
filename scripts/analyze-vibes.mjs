import fs from "fs";

const raw = JSON.parse(fs.readFileSync("scripts/reviews-raw.json", "utf8"));

// ── 느낌 어휘 사전 (카테고리 → 키워드들) ──────────────────────────
const VIBE_DICT = {
  활기참:    ["활기", "붐비", "북적", "에너지", "생동감", "시끌", "왁자지껄", "활발", "흥겨"],
  조용함:    ["조용", "한적", "여유", "차분", "고요", "평온", "한가", "여유롭"],
  낭만적:    ["낭만", "로맨틱", "데이트", "설레", "사랑스", "달달", "분위기 있", "감성적", "예쁜"],
  힙함:      ["힙", "힙스터", "트렌디", "트렌드", "핫플", "핫한", "뜨는", "떠오르는", "감각적"],
  이국적:    ["이국", "외국", "이태리", "프랑스", "유럽", "해외", "이국적", "이국감성", "외국느낌"],
  레트로:    ["레트로", "빈티지", "옛날", "복고", "뉴트로", "클래식", "오래된", "구옥"],
  자연적:    ["자연", "숲", "나무", "공원", "산책", "녹음", "초록", "풀", "꽃", "하늘", "강"],
  역사적:    ["역사", "전통", "고즈넉", "고궁", "한옥", "문화재", "유적", "궁", "고풍"],
  로컬:      ["로컬", "동네", "주민", "서민", "골목", "재래시장", "시장", "소박", "정겨", "정이"],
  세련됨:    ["세련", "고급", "럭셔리", "품격", "우아", "격조", "모던", "심플", "깔끔"],
  예술적:    ["예술", "갤러리", "전시", "문화", "아트", "공연", "뮤지컬", "극장", "창작"],
  맛있음:    ["맛있", "맛집", "맛", "맛나", "음식", "먹거리", "식도락", "미식", "별미"],
  카페감성:  ["카페", "커피", "디저트", "브런치", "베이커리", "인테리어 예쁜", "포토"],
  쇼핑:      ["쇼핑", "샵", "편집샵", "브랜드", "옷가게", "아이쇼핑", "매장"],
  혼자편함:  ["혼밥", "혼자", "1인", "솔로", "혼행", "혼술", "싱글"],
};

// ── 동행자×행위 키워드 감지 ───────────────────────────────────────
const ACTIVITY_KEYWORDS = {
  걷기:  ["산책", "걷기", "걷다", "거닐", "도보", "둘레길", "코스"],
  카페:  ["카페", "커피", "브런치", "디저트", "베이커리"],
  맛집:  ["맛집", "식당", "음식점", "밥", "먹", "맛있", "점심", "저녁", "브런치"],
  쇼핑:  ["쇼핑", "샵", "편집샵", "옷", "매장", "구매"],
  문화:  ["전시", "갤러리", "공연", "극장", "박물관", "문화", "아트"],
};

// ── 점수 계산 ─────────────────────────────────────────────────────
function scoreVibes(text) {
  const t = text.toLowerCase();
  const scores = {};
  for (const [vibe, keywords] of Object.entries(VIBE_DICT)) {
    scores[vibe] = keywords.filter(k => t.includes(k)).length;
  }
  return scores;
}

function detectActivity(text) {
  const t = text.toLowerCase();
  const hits = {};
  for (const [act, keywords] of Object.entries(ACTIVITY_KEYWORDS)) {
    hits[act] = keywords.filter(k => t.includes(k)).length;
  }
  return Object.entries(hits).sort((a, b) => b[1] - a[1])[0][1] > 0
    ? Object.entries(hits).sort((a, b) => b[1] - a[1])[0][0]
    : null;
}

// ── 지역별 느낌 분포 집계 ─────────────────────────────────────────
const regionVibes = {};   // region → vibe → total score
const acVibes = {};       // `${companion}×${activity}` → vibe → count

for (const [region, companions] of Object.entries(raw)) {
  regionVibes[region] = {};

  for (const [companion, review] of Object.entries(companions)) {
    if (!review) continue;
    const text = `${review.title} ${review.description}`;
    const scores = scoreVibes(text);
    const activity = detectActivity(text);

    // 지역별 누적
    for (const [vibe, score] of Object.entries(scores)) {
      regionVibes[region][vibe] = (regionVibes[region][vibe] || 0) + score;
    }

    // A×C 누적
    if (activity) {
      const key = `${companion}×${activity}`;
      if (!acVibes[key]) acVibes[key] = {};
      for (const [vibe, score] of Object.entries(scores)) {
        acVibes[key][vibe] = (acVibes[key][vibe] || 0) + score;
      }
    }
  }
}

// ── 정규화: 각 분포를 합이 1이 되는 확률로 ────────────────────────
function normalize(obj) {
  const total = Object.values(obj).reduce((a, b) => a + b, 0);
  if (total === 0) return obj;
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = Math.round((v / total) * 1000) / 1000;
  }
  return result;
}

// 상위 N개만
function topN(obj, n = 5) {
  return Object.fromEntries(
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .filter(([, v]) => v > 0)
  );
}

// ── 결과 출력 ─────────────────────────────────────────────────────
console.log("\n========== 지역별 느낌 분포 TOP5 ==========");
for (const [region, vibes] of Object.entries(regionVibes)) {
  const norm = topN(normalize(vibes), 5);
  const top = Object.entries(norm).map(([k, v]) => `${k}(${v})`).join(", ");
  console.log(`${region.padEnd(16)} : ${top}`);
}

console.log("\n========== A×C → 느낌 분포 ==========");
for (const [key, vibes] of Object.entries(acVibes).sort()) {
  const norm = topN(normalize(vibes), 4);
  const top = Object.entries(norm).map(([k, v]) => `${k}(${v})`).join(", ");
  console.log(`${key.padEnd(16)} : ${top}`);
}

// ── JSON 저장 ──────────────────────────────────────────────────────
const output = {
  regionVibeProfiles: Object.fromEntries(
    Object.entries(regionVibes).map(([r, v]) => [r, topN(normalize(v), 6)])
  ),
  acVibeProfiles: Object.fromEntries(
    Object.entries(acVibes).map(([k, v]) => [k, topN(normalize(v), 5)])
  ),
};

fs.writeFileSync("scripts/vibe-profiles.json", JSON.stringify(output, null, 2), "utf8");
console.log("\n→ scripts/vibe-profiles.json 저장 완료");
