import { regions } from "@/data/regions";
import type { Companion, Vibe, Activity, Region } from "@/lib/types";

export function recommendRegions(
  companion: Companion,
  vibe: Vibe,
  activity: Activity,
  topN = 3
): Region[] {
  // 1순위: A + B + C 모두 매칭
  const exact = regions.filter(
    (r) =>
      r.companions.includes(companion) &&
      r.vibes.includes(vibe) &&
      r.activities.includes(activity)
  );
  if (exact.length >= topN) return exact.slice(0, topN);

  // 2순위: B + C 매칭 (동행자 완화)
  const byVibeActivity = regions.filter(
    (r) => r.vibes.includes(vibe) && r.activities.includes(activity)
  );
  const merged = dedupe([...exact, ...byVibeActivity]);
  if (merged.length >= topN) return merged.slice(0, topN);

  // 3순위: B만 매칭 (행위 완화)
  const byVibe = regions.filter((r) => r.vibes.includes(vibe));
  return dedupe([...merged, ...byVibe]).slice(0, topN);
}

function dedupe(arr: Region[]): Region[] {
  return arr.filter((r, i, self) => self.findIndex((x) => x.id === r.id) === i);
}
