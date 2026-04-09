import type { Region, RegionAxes } from "./types";

// 느낌 텍스트 → 4축 벡터 변환 키워드 사전
const AXIS_KEYWORDS: Record<
  keyof RegionAxes,
  { high: string[]; low: string[] }
> = {
  에너지: {
    high: ["활기", "붐비", "핫", "북적", "시끌", "시끄", "에너지", "활발", "왁자"],
    low:  ["조용", "한적", "여유", "차분", "고요", "평온", "조용한", "한가"],
  },
  힙함: {
    high: ["힙", "감각적", "큐레이션", "인디", "독립", "트렌디", "세련", "감성적", "핫플"],
    low:  ["대중적", "관광지", "상업적", "무난"],
  },
  문화감: {
    high: ["전통", "역사", "레트로", "빈티지", "고즈넉", "한옥", "고궁", "옛날", "복고"],
    low:  ["이국", "외국", "글로벌", "유럽", "이태리", "이국적", "이국감성"],
  },
  자연: {
    high: ["자연", "숲", "공원", "산책", "녹음", "초록", "강변", "하천", "나무"],
    low:  ["도시", "번화가", "콘크리트", "빌딩"],
  },
};

type AxisKey = keyof RegionAxes;

// 텍스트에서 축별 방향 파싱 (1=낮음, 2=중립, 3=높음, undefined=신호없음)
export function parseVibeText(text: string): Partial<Record<AxisKey, 1 | 2 | 3>> {
  if (!text.trim()) return {};
  const t = text.toLowerCase();
  const result: Partial<Record<AxisKey, 1 | 2 | 3>> = {};

  for (const [axis, { high, low }] of Object.entries(AXIS_KEYWORDS) as [AxisKey, { high: string[]; low: string[] }][]) {
    const highHits = high.filter((k) => t.includes(k)).length;
    const lowHits  = low.filter((k) => t.includes(k)).length;
    if (highHits > lowHits) result[axis] = 3;
    else if (lowHits > highHits) result[axis] = 1;
    else if (highHits > 0) result[axis] = 2;
  }

  return result;
}

// 지역을 유저 느낌 벡터 기준으로 점수화 (0~1, 높을수록 잘 맞음)
export function scoreRegion(
  region: Region,
  vibeVector: Partial<Record<AxisKey, 1 | 2 | 3>>
): number {
  const axes = Object.keys(vibeVector) as AxisKey[];
  if (axes.length === 0) return 0;

  let total = 0;
  for (const axis of axes) {
    const desired = vibeVector[axis]!;
    const actual  = region.axes[axis];
    // 거리 0→1점, 거리 1→0.5점, 거리 2→0점
    total += (2 - Math.abs(desired - actual)) / 2;
  }
  return total / axes.length;
}
