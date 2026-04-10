import { regions } from "@/data/regions";
import type { Companion, Activity, Region } from "@/lib/types";
import { parseVibeText, scoreRegion } from "@/lib/vibe-match";

// ── C: 하드코딩 필터 리스트 ────────────────────────────────────────────────

const WALKING_REGIONS = new Set([
  // 한강공원
  "뚝섬/한강공원", "암사동/한강공원", "반포한강공원/서래마을", "여의도",
  // 산·등산로
  "북한산우이역", "도봉산/방학천", "회현/남산", "남산골/필동",
  // 선형공원·숲길
  "경의선숲길", "연남동", "서울숲", "경춘선 숲길/화랑대역", "마곡/보타닉공원",
  // 하천
  "중랑천/망우리", "양재/양재천",
  // 호수공원
  "잠실", "송리단길",
  // 기타
  "혜화/낙산공원", "서순라길/종묘/창덕궁",
]);

const HERITAGE_REGIONS = new Set([
  "서순라길/종묘/창덕궁", "안국/북촌", "서촌/경복궁역",
  "정동길/덕수궁", "남산골/필동", "인사동/낙원", "익선동",
]);

const ART_REGIONS = new Set([
  "혜화/낙산공원", "삼청동", "을지로 3가", "문래", "성수",
  "정동길/덕수궁", "안국/북촌", "봉은사/영동시장",
]);

const HARD_FILTER_MAP: Partial<Record<Activity, Set<string>>> = {
  걷기:  WALKING_REGIONS,
  유적지: HERITAGE_REGIONS,
  예술:  ART_REGIONS,
};

// ── A: 동행자별 기본 선호 정렬 ────────────────────────────────────────────

const COMPANION_SORT: Record<Companion, (r: Region) => number> = {
  부모님: (r) => r.axes.자연 * 2 + r.axes.문화감 - r.axes.에너지,
  혼자:   (r) => r.axes.힙함 * 2 - r.axes.에너지,
  연인:   (r) => r.axes.힙함 + r.axes.자연 - r.axes.에너지 * 0.5,
  친구:   (r) => r.axes.에너지 * 2 + r.axes.힙함,
};

// ── 추천 메인 함수 ─────────────────────────────────────────────────────────

export function recommendRegions(
  companion: Companion,
  activities: Activity[],   // 다중 선택
  query: string = "",
  topN = 3
): Region[] {
  // Step 1: C hard filter — 걷기/유적지/예술 선택 시 해당 지역만 (union)
  const hardSelected = activities.filter((a) => HARD_FILTER_MAP[a]);
  let candidates =
    hardSelected.length > 0
      ? regions.filter((r) =>
          hardSelected.some((a) => HARD_FILTER_MAP[a]!.has(r.name))
        )
      : [...regions];

  // Step 2: 쇼핑 선택 시 에너지 낮은 지역 제외 (에너지 1인 곳 scope out)
  if (activities.includes("쇼핑")) {
    candidates = candidates.filter((r) => r.axes.에너지 >= 2);
  }

  // Step 3: A — companion 매칭 여부로 우선순위 분리
  const withCompanion    = candidates.filter((r) =>  r.companions.includes(companion));
  const withoutCompanion = candidates.filter((r) => !r.companions.includes(companion));

  // Step 4: 정렬 — B(텍스트) 있으면 axes 유사도, 없으면 동행자 기본 선호
  const vibeVector = parseVibeText(query);
  const hasVibe    = Object.keys(vibeVector).length > 0;
  const defaultSort = COMPANION_SORT[companion];

  // 쇼핑 선택 시 에너지 보너스 추가
  const has쇼핑 = activities.includes("쇼핑");

  const sort = (arr: Region[]) =>
    [...arr].sort((a, b) => {
      const score = (r: Region) => {
        let s = 0;
        if (hasVibe)  s += scoreRegion(r, vibeVector) * (has쇼핑 ? 0.6 : 1.0);
        if (has쇼핑)  s += (r.axes.에너지 / 3) * (hasVibe ? 0.4 : 1.0);
        if (!hasVibe && !has쇼핑) s += defaultSort(r);
        return s;
      };
      return score(b) - score(a);
    });

  const ranked = [...sort(withCompanion), ...sort(withoutCompanion)];
  if (ranked.length >= topN) return ranked.slice(0, topN);

  // Fallback: 필터된 후보 부족 시 전체에서 보충
  const extra = regions
    .filter((r) => !candidates.includes(r) && r.companions.includes(companion));
  return dedupe([...ranked, ...sort(extra)]).slice(0, topN);
}

function dedupe(arr: Region[]): Region[] {
  return arr.filter((r, i, self) => self.findIndex((x) => x.id === r.id) === i);
}
