import { regions } from "@/data/regions";
import type { Companion, Activity, Region } from "@/lib/types";
import { parseVibeText, scoreRegion } from "@/lib/vibe-match";

// 동행자별 기본 선호 axes 가중치 (B 입력 없을 때 기본 정렬)
const COMPANION_SORT: Record<Companion, (r: Region) => number> = {
  부모님: (r) => r.axes.자연 * 2 + r.axes.문화감 - r.axes.에너지,
  혼자:   (r) => r.axes.힙함 * 2 - r.axes.에너지,
  연인:   (r) => r.axes.힙함 + r.axes.자연 - r.axes.에너지 * 0.5,
  친구:   (r) => r.axes.에너지 * 2 + r.axes.힙함,
};

export function recommendRegions(
  companion: Companion,
  activity: Activity,
  query: string = "",
  topN = 3
): Region[] {
  // ── Step 1: C(행위) → Hard filter ──────────────────────────────────
  const byActivity = regions.filter((r) => r.activities.includes(activity));

  // ── Step 2: A(동행자) → 매칭 여부로 우선순위 분리 ──────────────────
  const withCompanion    = byActivity.filter((r) =>  r.companions.includes(companion));
  const withoutCompanion = byActivity.filter((r) => !r.companions.includes(companion));

  // ── Step 3: 정렬 — B(텍스트) 있으면 axes 유사도, 없으면 동행자 기본 선호 ──
  const vibeVector = parseVibeText(query);
  const hasVibe    = Object.keys(vibeVector).length > 0;
  const defaultSort = COMPANION_SORT[companion];

  const sort = (arr: Region[]) =>
    [...arr].sort((a, b) =>
      hasVibe
        ? scoreRegion(b, vibeVector) - scoreRegion(a, vibeVector)
        : defaultSort(b) - defaultSort(a)
    );

  const ranked = [...sort(withCompanion), ...sort(withoutCompanion)];
  if (ranked.length >= topN) return ranked.slice(0, topN);

  // ── Fallback: activity 없는 지역에서 companion + 정렬 ───────────────
  const fallback = regions
    .filter((r) => !byActivity.includes(r) && r.companions.includes(companion));

  return dedupe([...ranked, ...sort(fallback)]).slice(0, topN);
}

function dedupe(arr: Region[]): Region[] {
  return arr.filter((r, i, self) => self.findIndex((x) => x.id === r.id) === i);
}
