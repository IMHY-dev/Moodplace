import { regions } from "@/data/regions";
import type { Companion, Activity, Region } from "@/lib/types";
import { parseVibeText, scoreRegion } from "@/lib/vibe-match";

export function recommendRegions(
  companion: Companion,
  activity: Activity,
  query: string = "",
  topN = 3
): Region[] {
  // ── Step 1: C(행위) → Hard filter ──────────────────────────────
  const byActivity = regions.filter((r) => r.activities.includes(activity));

  // ── Step 2: A(동행자) → companion 매칭 여부로 우선순위 분리 ────
  const withCompanion    = byActivity.filter((r) => r.companions.includes(companion));
  const withoutCompanion = byActivity.filter((r) => !r.companions.includes(companion));

  // ── Step 3: B(느낌 텍스트) → axes 유사도 점수로 정렬 ───────────
  const vibeVector = parseVibeText(query);
  const hasVibe = Object.keys(vibeVector).length > 0;

  const sortByVibe = (arr: Region[]) => {
    if (!hasVibe) return arr;
    return [...arr].sort((a, b) => scoreRegion(b, vibeVector) - scoreRegion(a, vibeVector));
  };

  // companion 매칭 우선, 각 그룹 내에서 vibe 순 정렬
  const ranked = [...sortByVibe(withCompanion), ...sortByVibe(withoutCompanion)];

  if (ranked.length >= topN) return ranked.slice(0, topN);

  // ── Fallback: activity 없이 전체에서 companion + vibe 기준 ─────
  const fallback = regions.filter((r) => !byActivity.includes(r));
  const fallbackRanked = sortByVibe(
    fallback.filter((r) => r.companions.includes(companion))
  );

  return dedupe([...ranked, ...fallbackRanked]).slice(0, topN);
}

function dedupe(arr: Region[]): Region[] {
  return arr.filter((r, i, self) => self.findIndex((x) => x.id === r.id) === i);
}
