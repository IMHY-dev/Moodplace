import fs from "fs";
import https from "https";

const CLIENT_ID = "jHv0lyvouNq5ZbKgxfRx";
const CLIENT_SECRET = "I66vQw3G9o";

const REGIONS = [
  "정동길/덕수궁","명동/재미로","을지로 3가","신당/중앙시장","남대문시장",
  "회현/남산","남산골/필동","용리단길","삼각지","해방촌","후암동",
  "이태원/경리단길","보광동","한남동","공덕/마포","경의선숲길",
  "홍대/상수 윗동네","합정/서교","연남동","망원동","연희동","홍제동",
  "진관동","부암동","평창동","서촌/경복궁역","안국/북촌","인사동/낙원",
  "익선동","서순라길/종묘/창덕궁","삼청동","종각","광장시장",
  "혜화/낙산공원","창신동","성북동","북한산우이역","도봉산/방학천",
  "경춘선 숲길/화랑대역","회기","청량리","중랑천/망우리","왕십리",
  "서울숲","성수","뚝섬/한강공원","건대입구","암사동/한강공원","잠실",
  "송리단길","선릉/역삼","압구정로데오/도산","강남역/신논현","논현/학동",
  "가로수길/신사","봉은사/영동시장","양재/양재천","반포한강공원/서래마을",
  "노량진수산시장/흑석동","문래","여의도","당산","대림동(多문화거리)","마곡/보타닉공원",
];

// 동행자별 검색 키워드 (대표 + 보조)
const COMPANION_QUERIES = {
  혼자:   ["혼자"],
  연인:   ["연인이랑", "남자친구랑", "여자친구랑"],
  친구:   ["친구랑", "친구들이랑"],
  부모님: ["부모님이랑", "엄마랑", "가족이랑"],
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function naverSearch(query) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(query);
    const options = {
      hostname: "openapi.naver.com",
      path: `/v1/search/blog?query=${encoded}&display=5&sort=sim`,
      headers: {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET,
      },
    };
    const req = https.get(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
  });
}

// HTML 태그 제거
function stripHtml(str) {
  return str.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim();
}

async function main() {
  const OUTPUT = "scripts/reviews-raw.json";

  // 이어서 실행 가능하도록 기존 결과 로드
  let results = {};
  if (fs.existsSync(OUTPUT)) {
    results = JSON.parse(fs.readFileSync(OUTPUT, "utf8"));
    console.log(`기존 결과 ${Object.keys(results).length}개 로드`);
  }

  for (const region of REGIONS) {
    if (!results[region]) results[region] = {};

    for (const [companion, queries] of Object.entries(COMPANION_QUERIES)) {
      if (results[region][companion]) {
        console.log(`  SKIP: ${region} / ${companion}`);
        continue;
      }

      let found = null;
      for (const q of queries) {
        const searchQuery = `${region} ${q} 후기`;
        try {
          const data = await naverSearch(searchQuery);
          await sleep(120);

          if (data.items && data.items.length > 0) {
            // 설명이 가장 긴 것 선택 (내용이 풍부한 후기일 가능성)
            const best = data.items.reduce((a, b) =>
              b.description.length > a.description.length ? b : a
            );
            found = {
              query: searchQuery,
              title: stripHtml(best.title),
              description: stripHtml(best.description),
              link: best.link,
              bloggername: best.bloggername,
            };
            break;
          }
        } catch (e) {
          console.error(`  ERROR: ${region}/${companion}/${q}:`, e.message);
          await sleep(500);
        }
      }

      results[region][companion] = found;
      const status = found ? "✓" : "✗";
      console.log(`${status} ${region} / ${companion}`);

      // 매번 저장 (중간에 끊겨도 안전)
      fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2), "utf8");
      await sleep(150);
    }
  }

  console.log("\n완료! →", OUTPUT);
}

main().catch(console.error);
