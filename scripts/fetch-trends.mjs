import fs from "fs";
import https from "https";

const CLIENT_ID = "jHv0lyvouNq5ZbKgxfRx";
const CLIENT_SECRET = "I66vQw3G9o";

// 지역명 → 실제 검색 키워드 (간결하게)
const REGION_KEYWORDS = [
  ["정동길/덕수궁",            "덕수궁"],
  ["명동/재미로",              "명동"],
  ["을지로 3가",               "을지로"],
  ["신당/중앙시장",            "신당동"],
  ["남대문시장",               "남대문시장"],
  ["회현/남산",                "남산"],
  ["남산골/필동",              "남산골"],
  ["용리단길",                 "용리단길"],
  ["삼각지",                   "삼각지"],
  ["해방촌",                   "해방촌"],
  ["후암동",                   "후암동"],
  ["이태원/경리단길",          "이태원"],
  ["보광동",                   "보광동"],
  ["한남동",                   "한남동"],
  ["공덕/마포",                "공덕"],
  ["경의선숲길",               "경의선숲길"],
  ["홍대/상수 윗동네",         "홍대"],
  ["합정/서교",                "합정"],
  ["연남동",                   "연남동"],
  ["망원동",                   "망원동"],
  ["연희동",                   "연희동"],
  ["홍제동",                   "홍제동"],
  ["진관동",                   "진관동"],
  ["부암동",                   "부암동"],
  ["평창동",                   "평창동"],
  ["서촌/경복궁역",            "서촌"],
  ["안국/북촌",                "북촌"],
  ["인사동/낙원",              "인사동"],
  ["익선동",                   "익선동"],
  ["서순라길/종묘/창덕궁",     "창덕궁"],
  ["삼청동",                   "삼청동"],
  ["종각",                     "종각"],
  ["광장시장",                 "광장시장"],
  ["혜화/낙산공원",            "혜화"],
  ["창신동",                   "창신동"],
  ["성북동",                   "성북동"],
  ["북한산우이역",             "북한산"],
  ["도봉산/방학천",            "도봉산"],
  ["경춘선 숲길/화랑대역",     "경춘선숲길"],
  ["회기",                     "회기"],
  ["청량리",                   "청량리"],
  ["중랑천/망우리",            "중랑천"],
  ["왕십리",                   "왕십리"],
  ["서울숲",                   "서울숲"],
  ["성수",                     "성수동"],
  ["뚝섬/한강공원",            "뚝섬"],
  ["건대입구",                 "건대"],
  ["암사동/한강공원",          "암사동"],
  ["잠실",                     "잠실"],
  ["송리단길",                 "송리단길"],
  ["선릉/역삼",                "선릉"],
  ["압구정로데오/도산",        "압구정"],
  ["강남역/신논현",            "강남역"],
  ["논현/학동",                "논현"],
  ["가로수길/신사",            "가로수길"],
  ["봉은사/영동시장",          "봉은사"],
  ["양재/양재천",              "양재천"],
  ["반포한강공원/서래마을",    "서래마을"],
  ["노량진수산시장/흑석동",    "노량진"],
  ["문래",                     "문래동"],
  ["여의도",                   "여의도"],
  ["당산",                     "당산"],
  ["대림동(多문화거리)",       "대림동"],
  ["마곡/보타닉공원",          "마곡"],
];

// 앵커 키워드 (매 배치에 포함 → 배치간 정규화 기준)
const ANCHOR = { name: "__anchor__", keyword: "강남" };

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function datalabRequest(keywordGroups) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      startDate: "2024-01-01",
      endDate:   "2024-12-31",
      timeUnit:  "month",
      keywordGroups,
    });
    const options = {
      hostname: "openapi.naver.com",
      path: "/v1/datalab/search",
      method: "POST",
      headers: {
        "X-Naver-Client-Id":     CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET,
        "Content-Type":          "application/json",
        "Content-Length":        Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// 월별 평균 계산
function avgRatio(results, groupName) {
  const group = results.find(r => r.title === groupName);
  if (!group) return 0;
  const vals = group.data.map(d => d.ratio);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

async function main() {
  const scores = {}; // regionName → normalized score

  // 배치: 4개 지역 + 앵커 = 5개
  const BATCH_SIZE = 4;
  for (let i = 0; i < REGION_KEYWORDS.length; i += BATCH_SIZE) {
    const batch = REGION_KEYWORDS.slice(i, i + BATCH_SIZE);

    const keywordGroups = [
      { groupName: ANCHOR.name, keywords: [ANCHOR.keyword] },
      ...batch.map(([, kw]) => ({ groupName: kw, keywords: [kw] })),
    ];

    try {
      const res = await datalabRequest(keywordGroups);
      if (!res.results) {
        console.error("API error:", JSON.stringify(res));
        continue;
      }

      const anchorScore = avgRatio(res.results, ANCHOR.name);

      for (const [regionName, keyword] of batch) {
        const raw = avgRatio(res.results, keyword);
        // 앵커 대비 비율 (강남=100 기준)
        scores[regionName] = anchorScore > 0 ? (raw / anchorScore) * 100 : 0;
        console.log(`${regionName.padEnd(20)} ${keyword.padEnd(12)} raw=${raw.toFixed(1)} norm=${scores[regionName].toFixed(1)}`);
      }
    } catch(e) {
      console.error(`배치 ${i}~${i+BATCH_SIZE} 오류:`, e.message);
    }

    await sleep(300);
  }

  // 정렬 출력
  console.log("\n========== 검색량 순위 (강남=100 기준) ==========");
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([name, score], idx) => {
    console.log(`${String(idx+1).padStart(2)}. ${name.padEnd(22)} ${score.toFixed(1)}`);
  });

  // 상중하 분류 (상위 33% = 상, 하위 33% = 하)
  const vals = sorted.map(s => s[1]);
  const p33 = vals[Math.floor(vals.length * 0.66)];
  const p66 = vals[Math.floor(vals.length * 0.33)];

  console.log("\n========== 에너지 상중하 분류 ==========");
  const groups = { 상: [], 중: [], 하: [] };
  for (const [name, score] of sorted) {
    const level = score >= p66 ? "상" : score >= p33 ? "중" : "하";
    groups[level].push(`${name}(${score.toFixed(0)})`);
  }
  console.log(`상(${groups["상"].length}): ${groups["상"].join(", ")}`);
  console.log(`중(${groups["중"].length}): ${groups["중"].join(", ")}`);
  console.log(`하(${groups["하"].length}): ${groups["하"].join(", ")}`);

  fs.writeFileSync("scripts/trends-raw.json", JSON.stringify(scores, null, 2), "utf8");
  console.log("\n→ scripts/trends-raw.json 저장");
}

main().catch(console.error);
